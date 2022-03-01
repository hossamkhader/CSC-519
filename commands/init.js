const chalk = require('chalk');
const path = require('path');
const child = require('child_process');

exports.command = 'init';
exports.desc = 'Prepare tool';
exports.builder = yargs => {
    yargs.options({
    });
};


exports.handler = async argv => {
    const { processor } = argv;

    console.log(chalk.green("Preparing computing environment..."));

    
    console.log(chalk.green("Pulling ubuntu focal image..."));
    child.exec(`bakerx pull focal cloud-images.ubuntu.com`);


    let cmd = `bakerx run pipeline-vm focal`
    let subprocess = child.exec(cmd);


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

};