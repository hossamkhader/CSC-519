const yaml = require('yaml');
const path = require('path');
const fs = require('fs');
const build_name_import = require('../commands/build.js').build_name;
const spec_file = require('../commands/build.js').spec_file;

let build_spec_path;
if(typeof spec_file !== 'undefined') {
    build_spec_path = path.join(path.dirname(require.main.filename), String(spec_file));
} else {
    build_spec_path = path.join(path.dirname(require.main.filename), 'sample.yml');
}
const build_spec_file = fs.readFileSync(build_spec_path, 'utf8');

let build_name = "";
if(typeof build_name_import !== 'undefinted') {
    build_name = build_name_import;
}
function parse_build_spec() {
    commands = [];
    build_spec = yaml.parse(build_spec_file);
    for (job of build_spec['jobs']) {
        if(job['name'] == String(build_name)) {
            for (step of job['steps']) {
                commands.push(step['run'])
            }
        }
    }
    return commands;
}

module.exports = parse_build_spec();

