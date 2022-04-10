const exec = require('child_process').exec;
const chalk = require('chalk');
const md5File = require('md5-file');
const ast_rewrite = require('./ast_rewrite');

let changes = new Set();


let snapshots = [
    'http://localhost:3000/survey/long.md', 
    'http://localhost:3000/survey/upload.md', 
    'http://localhost:3000/survey/survey.md', 
    'http://localhost:3000/survey/variations.md'
];

async function _exec(command) {
    return new Promise(function (resolve, reject) {
        let subprocess = exec(`${command}`, {maxBuffer: 1024*5000});
        subprocess.stdout.on('data', stdout => {
            console.log( chalk.gray(stdout.toString() ));
        });
        subprocess.stderr.on('data', stderr => {
            console.log( chalk.gray(stderr.toString() ));
        });
        // Subscribe to error starting process or process exiting events.
        subprocess.on('error', err => {
            console.log( chalk.red( err.message ) );
            reject(err);
        });
        subprocess.on('exit', code => {
            resolve(code);
        });
    });
}

async function run() {
    await _exec('cd ../checkbox.io-micro-preview && git restore marqdown.js');
    var change = ast_rewrite.main();
    await _exec('lsof -ti tcp:3000 | xargs kill > /dev/null 2>&1');
    var microservice = exec('node index.js', {cwd: '../checkbox.io-micro-preview'});
    await sleep(1000);
    await _exec('rm -rf snapshots/tmp/*');
    for (let snapshot of snapshots) {
        var file_name = snapshot.split('/')[4].split('.')[0]
        await _exec(`../screenshot/screenshot.js ${snapshot} snapshots/tmp/${file_name} > /dev/null 2>&1`);
        if (md5File.sync(`snapshots/tmp/${file_name}.png`) != md5File.sync(`snapshots/baseline/${file_name}.png`)) {
            if (!changes.has(change)) 
            {
                changes.add(change);
                count = changes.size;
                console.log(`TEST FAIL for ${file_name}`);
                await _exec(`mkdir results/${count}`);
                await _exec(`cp snapshots/tmp/${file_name}.png results/${count}`);
                await _exec(`echo "${change}" > results/${count}/change`);
            }
        }
    }
    microservice.kill();
    await _exec('cd ../checkbox.io-micro-preview && git restore marqdown.js');
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function main() {
    await _exec('rm -rf results/*');
    for (i=0; i < 1000; i++) {
        await run();
    }
}


if (require.main === module) {
    main();
}