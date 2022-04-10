const chalk = require("chalk");
const child = require("child_process");

exports.command = "init";
exports.desc = "Prepare tool";
exports.builder = (yargs) => {
  yargs.options({});
};

exports.handler = async (argv) => {

  console.log(chalk.green("Preparing computing environment..."));

  // bakerx check
  console.log(chalk.green("--- Check bakerx is installed ---"));
  try {
    child.execSync("bakerx --version");
    console.log(chalk.green("bakerx is installed."));
  }
  catch (err) {
    console.log(chalk.red("FAILED: bakerx is NOT installed."));
    process.exit();
  }

  console.log(chalk.green("Pulling ubuntu focal image..."));
  try {
    child.execSync(`bakerx pull focal cloud-images.ubuntu.com`);
    console.log(chalk.green("focal image pull returned with no errors."));
  }
  catch (err) {
    console.error(chalk.red("FAILED: focal image pull failed."));
    process.exit();
  }

  console.log(chalk.green("Deleting leftover VM"));
  try {
    child.execSync(`bakerx delete vm pipeline-vm`);
  }
  catch (err) {

  }

  console.log(chalk.green("Creating VM pipeline-vm..."));
  try {
    child.execSync(`bakerx run pipeline-vm focal --memory 2048 --sync`);
    console.log(chalk.green("pipeline-vm creation succeeded."));
  }
  catch (err) {
    console.error(chalk.red("FAILED: pipeline-vm VM creation failed."));
  }
  
  console.log(chalk.green("SSH command: bakerx ssh pipeline-vm"));

};
