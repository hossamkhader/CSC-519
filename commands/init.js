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

    
    let subprocess = child.exec(`bakerx run pipeline-vm focal`);

    let x = child.exec(`bakerx ssh-info pipeline-vm`);

    x.stdout.on('data', stdout => {
        ssh_command = stdout.toString();
        console.log( chalk.gray(ssh_command));
    });
};