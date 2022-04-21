const exec = require('child_process').exec;
const util = require('util');
const path = require('path');
const chalk = require('chalk');
parse_job_spec = require('../lib/jobSpec');


exports.command = 'build <job_name> <spec_file>';
exports.desc = 'Automatically configure a build environment for given build job specification';





let ssh_command;

async function get_ssh_command() {
    return new Promise(function (resolve, reject) {
        let subprocess = exec(`bakerx ssh-info pipeline-vm`);
        subprocess.stdout.on('data', stdout => {
            ssh_command = stdout.toString().trim() + " -o UserKnownHostsFile=/dev/null";
        });
        subprocess.on('exit', code => {
            resolve(ssh_command.trim());
        });
    });
}

async function _exec(command) {
    return new Promise(function (resolve, reject) {
        let subprocess = exec(`${ssh_command} "$printf ${command}"`, {maxBuffer: 1024*5000});
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
    job_name = process.argv[3];
    spec_file = process.argv[4];
    job_specs = parse_job_spec(spec_file, job_name);
    console.log(chalk.green("Building..."));
    ssh_command = await get_ssh_command();
    if ('steps' in job_specs) {
        for (step of job_specs.steps) {
            console.log(step);
            await _exec(step);
        }
    }
    if ('mutation' in job_specs) {
        snapshots = job_specs.mutation.snapshots.join(' ');
        await _exec(`cd mutation-coverage && node index.js ${job_specs.mutation.url} ${job_specs.mutation.iterations} ${snapshots}`);
    }
    
        
};