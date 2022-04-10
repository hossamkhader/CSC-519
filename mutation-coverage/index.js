const exec = require('child_process').exec;
const chalk = require('chalk');
const md5File = require('md5-file');
const ast_rewrite = require('./ast_rewrite');

let changes = new Set();

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
    for (let snapshot of snapshots) {
        var file_name = snapshot.split('/')[4].split('.')[0]
        await _exec(`../screenshot/screenshot.js ${snapshot} snapshots/tmp/${file_name} > /dev/null 2>&1`);
        if (md5File.sync(`snapshots/tmp/${file_name}.png`) != md5File.sync(`snapshots/baseline/${file_name}.png`)) {
            if (!changes.has(change)) 
            {
                changes.add(change);
                count = changes.size;
                console.log(change);
                console.log(`TEST FAIL for ${file_name}`);
                console.log(`Saving a snapshot and the change that caused the test to fail in results/${count}`);
                await _exec(`mkdir results/${count}`);
                await _exec(`cp snapshots/tmp/${file_name}.png results/${count}`);
                await _exec(`echo "${change}" > results/${count}/change`);
            }
        }
    }
    microservice.kill();
    await _exec('rm -rf snapshots/tmp/*');
    await _exec('cd ../checkbox.io-micro-preview && git restore marqdown.js');
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function main() {
    url = process.argv[2]
    iterations = process.argv[3]
    snapshots = process.argv.slice(4, process.argv.size)

    await _exec('rm -rf results/*');
    await _exec(`cd .. && git clone ${url}`);
    await _exec('cd ../checkbox.io-micro-preview && npm install');
    
    for (i=0; i < iterations; i++) {
        await run();
    }
}


if (require.main === module) {
    main();
}