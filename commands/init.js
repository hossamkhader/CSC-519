const chalk = require('chalk');
const path = require('path');
const child = require('child_process');

const buildSpec = require('../lib/buildSpec');

exports.command = 'init';
exports.desc = 'Prepare tool';
exports.builder = yargs => {
    yargs.options({
    });
};


exports.handler = async argv => {

    const { processor } = argv;

    console.log(chalk.green("Preparing computing environment..."));

    console.log(chalk.green("Deleting leftover VM"));

    try {
        child.execSync(`bakerx delete vm pipeline-vm`);
        console.log(chalk.green("Delete successful"));
    } catch (error) {
        console.log(chalk.green("There are no VMs to delete."));
    }

    console.log(chalk.green("Pulling ubuntu focal image..."));
    child.exec(`bakerx pull focal cloud-images.ubuntu.com`);

    console.log(chalk.green("Creating VM pipeline-vm..."));
    child.execSync(`bakerx run pipeline-vm focal --memory 2048`);

    let ssh_command_subprocess = child.exec(`bakerx ssh-info pipeline-vm`);

    ssh_command_subprocess.stdout.on('data', stdout => {
        ssh_command = stdout.toString();
        console.log( chalk.gray(ssh_command));
    });
};
