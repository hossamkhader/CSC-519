const exec = require('child_process').exec;
const util = require('util');
const path = require('path');
const chalk = require('chalk');

let build_name = "";
let spec_file = "";

async function getArgv() {
    exports.command = 'build <command> <command>';
    exports.desc = 'Automatically configure a build environment for given build job specification';
    exports.builder = yargs => {
        yargs.commands('<build_job_name> <spec_file.yml>').version(false);
    };
    build_name = process.argv[3];
    spec_file = process.argv[4];
    exports.build_name = build_name;
    exports.spec_file = spec_file;
    return 1;
}
getArgv().then(console.log( chalk.gray( "Build name: " + build_name + "\nSpec file: " + spec_file) ));

const buildSpec = require('../lib/buildSpec');
let ssh_command;

async function get_ssh_command() {
    return new Promise(function (resolve, reject) {
        let subprocess = exec(`bakerx ssh-info pipeline-vm`);
        subprocess.stdout.on('data', stdout => {
            ssh_command = stdout.toString();
        });
        subprocess.on('exit', code => {
            resolve(ssh_command.trim());
        });
    });
}

async function _exec(command) {
    return new Promise(function (resolve, reject) {
        let subprocess = exec(`${ssh_command} ${command}`);
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


exports.handler = async argv => {
    console.log(chalk.green("Building..."));
    ssh_command = await get_ssh_command();

    for (command of buildSpec) {
        console.log(command);
        await _exec(command);
    }
        
};