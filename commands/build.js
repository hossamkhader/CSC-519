const child = require('child_process');
const path = require('path');
const chalk = require('chalk');

const buildSpec = require('../lib/buildSpec');

exports.command = 'build';
exports.desc = 'Build';
exports.builder = yargs => {
    yargs.options({
    });
};


exports.handler = async argv => {
    const { processor } = argv;

    console.log(chalk.green("Building..."));

    let ssh_command_subprocess = child.exec(`bakerx ssh-info pipeline-vm`);

    ssh_command_subprocess.stdout.on('data', stdout => {
        ssh_command = stdout.toString();
        for (command of buildSpec) {
            subprocess = child.exec(ssh_command + ' ' + command);
        }
    });
};