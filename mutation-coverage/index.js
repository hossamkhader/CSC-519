const exec = require('child_process').exec;
const chalk = require('chalk');
const md5File = require('md5-file');


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
    await _exec('cd ASTRewrite && node index.js');
    let microservice = exec('node index.js', {cwd: '../checkbox.io-micro-preview'});
    await sleep(1000);
    await _exec('rm -f snapshots/tmp/*');
    for (let snapshot of snapshots) {
        let file_name = snapshot.split('/')[4].split('.')[0]
        await _exec(`../screenshot/screenshot.js ${snapshot} snapshots/tmp/${file_name}`);
        if (md5File.sync(`snapshots/tmp/${file_name}.png`) != md5File.sync(`snapshots/baseline/${file_name}.png`)) {
            console.log(`TEST FAIL for ${file_name}`);
        }
    }
    microservice.kill();
    await _exec('cd ../checkbox.io-micro-preview && git restore marqdown.js');
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function main() {

    for (i=0; i < 1000; i++) {
        await run();
    }
}


if (require.main === module) {
    main();
}