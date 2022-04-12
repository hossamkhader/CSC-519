
const esprima = require("esprima");
const escodegen = require("escodegen");
const options = {tokens:true, tolerant: true, loc: true, range: true };
const fs = require("fs");
const chalk = require('chalk');

let operations = [ 
    NegateConditionals, 
    ConditionalBoundary, 
    IncrementalMutations, 
    ConditionalExpression, 
    //NonEmptyString, 
    //MutateControlFlow,
    ConstantReplacement, 
    CloneReturnEarly
]

function rewrite( filepath, newPath ) {

    var buf = fs.readFileSync(filepath, "utf8");
    var ast = esprima.parse(buf, options);    

    let op = operations[getRandomInt(operations.length)];
    
    var change = op(ast);

    let code = escodegen.generate(ast);
    fs.writeFileSync( newPath, code);

    return change;
}

function NegateConditionals(ast) {

    let candidates = [];
    let change;

    let i = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" ) {
            if ( [">", "<", "==", "!="].includes(node.operator) ) {
                candidates.push(i);
            }
            i++;
        }
    })

    let mutateTarget = candidates[getRandomInt(candidates.length)];
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" ) {
            if( current === mutateTarget ) {
                if ( node.operator === ">" ) {
                    node.operator = "<";
                    change = `Replacing > with < on line ${node.loc.start.line}`;
                }
                else if ( node.operator === "<" ) {
                    node.operator = ">";
                    change = `Replacing < with > on line ${node.loc.start.line}`;
                }
                else if ( node.operator === "==" ) {
                    node.operator = "!=";
                    change = `Replacing == with != on line ${node.loc.start.line}`;
                }
                else if ( node.operator === "!=" ) {
                    node.operator = "==";
                    change = `Replacing != with == on line ${node.loc.start.line}`;
                }
            }
            current++;
        }
    })
    return change;
}

function IncrementalMutations(ast) {

    let candidates = [];
    let change;

    let i = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "UpdateExpression" ) {
            if ( ["++", "--",].includes(node.operator) ) {
                candidates.push(i);
            }
            i++;
        }
    })

    let mutateTarget = candidates[getRandomInt(candidates.length)];
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "UpdateExpression" ) {
            if( current === mutateTarget ) {
                if( node.prefix == true ) {
                    change = `Replacing ${node.operator}${node.argument.name} with ${node.argument.name}${node.operator} on line ${node.loc.start.line}`;
                }
                else {
                    change = `Replacing ${node.argument.name}${node.operator} with ${node.operator}${node.argument.name} on line ${node.loc.start.line}`;
                }
                node.prefix = !node.prefix
            }
            current++;
        }
    })
    return change;
}

function ConditionalExpression(ast) {

    let candidates = [];
    let change;

    let i = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "LogicalExpression" ) {
            if ( ["&&", "||",].includes(node.operator) ) {
                candidates.push(i);
            }
            i++;
        }
    })

    let mutateTarget = candidates[getRandomInt(candidates.length)];
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "LogicalExpression" ) {
            if( current === mutateTarget ) {
                if( node.operator === "&&" ) {
                    change = `Replacing && with || on line ${node.loc.start.line}`;
                    node.operator = "||";
                }
                    
                else if ( node.operator === "||" ) {
                    change = `Replacing || with && on line ${node.loc.start.line}`;
                    node.operator = "&&";
                }
            }
            current++;
        }
    })
    return change;
}

function MutateControlFlow(ast) {

    let candidates = [];
    let change;

    let i = 0;
    traverseWithParents(ast, (node) => {
        if( "alternate" in node && node.type === "BlockStatement" ) {
            candidates.push(i);
            i++;
        }
    })

    let mutateTarget = candidates[getRandomInt(candidates.length)];
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( "alternate" in node && node.type === "BlockStatement" ) {
            if( current === mutateTarget ) {
                change = `Replacing "if" with "else if" on line ${node.loc.start.line}`;
                node.type = "IfStatement";
            }
            current++;
        }
    })
    return change;
}

function NonEmptyString(ast) {

    let candidates = [];
    let change;

    let i = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" ) {
            if ( node.value === "" ) {
                candidates.push(i);
            }
            i++;
        }
    })

    let mutateTarget = candidates[getRandomInt(candidates.length)];
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" ) {
            if( current === mutateTarget ) {
                change = `Replacing "" with "<div>Bug</div>" on line ${node.loc.start.line}`;
                node.value = "<div>Bug</div>";
            }
            current++;
        }
    })
    return change;
}

function CloneReturnEarly(ast) {

    let candidates = [];
    let change;

    let i = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "FunctionDeclaration" ) {
            traverseWithParents(node, (subnode) => {
                if ( subnode.type === "ReturnStatement" && subnode.argument.name === "embeddedHtml" ) {
                    candidates.push(i);
                }
            })
            i++;
        }
    })

    let mutateTarget = candidates[getRandomInt(candidates.length)];
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "FunctionDeclaration" ) {
            if( current === mutateTarget ) {
                var randomLocation = getRandomInt(node.body.body.length);
                node.body.body.splice(randomLocation, 0, {"type": "ReturnStatement","argument": {"type": "Identifier","name": "embeddedHtml"}});
                change = `Inserting "return embeddedHtml;" on line ${node.loc.start.line + randomLocation}`;
            }
            current++;
        }
    })
    return change;
}

function ConstantReplacement(ast) {

    let candidates = [];
    let change;

    let i = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" ) {
            if ( node.value == 0 ) {
                candidates.push(i);
            }
            i++;
        }
    })

    let mutateTarget = candidates[getRandomInt(candidates.length)];
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" ) {
            if( current === mutateTarget ) {
                change = `Replacing 0 with 3 on line ${node.loc.start.line}`;
                node.value = 3;
            }
            current++;
        }
    })
    return change;
}

function ConditionalBoundary(ast) {

    let candidates = [];
    let change;

    let i = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" ) {
            if ( [">", "<", ">=", "<="].includes(node.operator) ){
                candidates.push(i);
            }
            i++;
        }
    })

    let mutateTarget = candidates[getRandomInt(candidates.length)];
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" ) {
            if( current === mutateTarget ) {
                if ( node.operator === ">" ) {
                    node.operator = ">=";
                    change = `Replacing > with >= on line ${node.loc.start.line}`;
                }
                else if ( node.operator === "<" ) {
                    node.operator = "<=";
                    change = `Replacing < with <= on line ${node.loc.start.line}`;
                }
                else if ( node.operator === ">=" ) {
                    node.operator = ">";
                    change = `Replacing >= with > on line ${node.loc.start.line}`;
                }
                else if ( node.operator === "<=" ) {
                    node.operator = "<";
                    change = `Replacing <= with < on line ${node.loc.start.line}`;
                }
            }
            current++;
        }
    })
    return change;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
            	child.parent = object;
					traverseWithParents(child, visitor);
            }
        }
    }
}

// Helper function for counting children of node.
function childrenLength(node)
{
	var key, child;
	var count = 0;
	for (key in node) 
	{
		if (node.hasOwnProperty(key)) 
		{
			child = node[key];
			if (typeof child === 'object' && child !== null && key != 'parent') 
			{
				count++;
			}
		}
	}	
	return count;
}


// Helper function for checking if a node is a "decision type node"
function isDecision(node)
{
	if( node.type == 'IfStatement' || node.type == 'ForStatement' || node.type == 'WhileStatement' ||
		 node.type == 'ForInStatement' || node.type == 'DoWhileStatement')
	{
		return true;
	}
	return false;
}

// Helper function for printing out function name.
function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "anon function @" + node.loc.start.line;
}


function main()
{
    return rewrite("/home/vagrant/checkbox.io-micro-preview/marqdown.js", "/home/vagrant/checkbox.io-micro-preview/marqdown.js");
}

module.exports = { main };
