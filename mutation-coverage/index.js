const chalk = require('chalk');
const { exec, execSync } = require('child_process');
const md5File = require('md5-file');
const ast_rewrite = require('./ast_rewrite');

let changes = new Set();

function _exec(command) {
    try {
        execSync(`${command}`, {maxBuffer: 1024*5000});
    }
    catch (err) {
    }
}

async function run() {
    execSync('cd ../checkbox.io-micro-preview && git restore marqdown.js');
    var change = ast_rewrite.main();
    _exec('lsof -ti tcp:3000 | xargs kill > /dev/null 2>&1');
    var microservice = exec('node index.js', {cwd: '../checkbox.io-micro-preview'});
    await sleep(1000);
    for (let snapshot of snapshots) {
        var file_name = snapshot.split('/')[4].split('.')[0]
        _exec(`../screenshot/screenshot.js ${snapshot} snapshots/tmp/${file_name} > /dev/null 2>&1`);
        if (md5File.sync(`snapshots/tmp/${file_name}.png`) != md5File.sync(`snapshots/baseline/${file_name}.png`)) {
            if (typeof(change) != 'undefined' && !changes.has(change)) {
                changes.add(change);
                count = changes.size;
                console.log(change);
                console.log(`TEST FAIL for ${file_name}`);
                console.log(`Saving a snapshot and the change that caused the test to fail in results/${count}`);
                _exec(`mkdir results/${count}`);
                _exec(`cp snapshots/tmp/${file_name}.png results/${count}`);
                _exec(`echo "${change}" > results/${count}/change`);
            }
        }
    }
    microservice.kill();
    _exec('rm -rf snapshots/tmp/*');
    _exec('cd ../checkbox.io-micro-preview && git restore marqdown.js');
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function main() {
    url = process.argv[2]
    iterations = process.argv[3]
    snapshots = process.argv.slice(4, process.argv.size)

    _exec('rm -rf results/*');
    _exec(`cd .. && git clone ${url}`);
    _exec('cd ../checkbox.io-micro-preview && npm install');
    
    for (i=0; i < iterations; i++) {
        await run();
    }
}


if (require.main === module) {
    main();
}