const chalk = require("chalk");
const path = require("path");
const child = require("child_process");

const buildSpec = require("../lib/buildSpec");

exports.command = "init";
exports.desc = "Prepare tool";
exports.builder = (yargs) => {
  yargs.options({});
};

exports.handler = async (argv) => {
  const { processor } = argv;

  console.log(chalk.green("Preparing computing environment..."));
  console.log(chalk.green("--- Check bakerx is installed ---"));

  child.exec("bakerx --version", (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      console.log(chalk.red("FAILED: bakerx is NOT installed."));
      return;
    }
    console.log(stdout);
    console.log(chalk.green("bakerx is installed."));
  });

  console.log(chalk.green("--- Pulling ubuntu focal image ---"));
  child.exec(
    `bakerx pull focal cloud-images.ubuntu.com`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        console.log(chalk.red("FAILED: focal image pull failed."));
        return;
      }
      console.log(stdout);
      console.log(chalk.green("focal image pull returned with no errors."));
    }
  );

  //TODO: Ensure console output arrives in order i.e. read up on execSync

  console.log(chalk.green("Creating VM pipeline-vm..."));
  child.execSync(`bakerx run pipeline-vm focal --memory 2048`);

  let ssh_command_subprocess = child.exec(`bakerx ssh-info pipeline-vm`);

  ssh_command_subprocess.stdout.on("data", (stdout) => {
    ssh_command = stdout.toString();
    console.log(chalk.gray(ssh_command));
  });
};
