# Pipeline Project

## .env
Your .env file should contain the following keys:
GITHUB_ACCESS_TOKEN=***************

## Steps to Run
* `pipeline init`  Automatically provisions and configures a build server
* `pipeline build <build-job-name> <spec-file.yml>`    Automatically configures a build environment for the <build-job-name> job specification in the <spec-file.yml> spec file
  * To build iTrust, run `pipeline build build-itrust build.yml`

## M1 Report
 
### Our Design
 * The user passes in the name of a job in a yaml file to build in the command line, then that job in the user provided yaml file gets built. This is so that in the future, if we hav multiple jobs in multiple yaml spec files, we can pass through the CLI the name of the job we want to run and what spec file it is in.

### Issues We Faced
 * Before Checkpoint
   * Having to edit the application.yml with our credentials
   * mysql driver was deprecated, we had to update the application.yml to fix this
   * Currently running to error running iTrust2 tests
     * ![Task2 - iTrust2 Tests Fail](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-37/blob/main/images/Task2_iTrust2_Tests_Fail.png)
 * After Checkpoint
   * Having test result standard output print to terminal. There is too much output that it seems to overflow the stdout buffer
     * ![Task3 - stdout Overflow](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-37/blob/main/images/Task3_stdout_overflow.png)
   * Passing in commands with special characters (quotations, dashes) to VM using bakerx. We had to do very tedious things to escape these characgters
     * ![Task2 - Escaping Quotations](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-37/blob/main/images/Task2_Escape_Characters.png)
   * Specifying right amount of memory for server to be able to build iTrust job
   * Sync issues due to taking in command line arguments. We had to make certain functions asynchronous(parsing the spec file) so that they only ran after the we have read in the user's command line arguments

### What We Learned
 * How to automatically provision and configure a build server using Javascript
 * How to write a build specification in a yaml file for a server to build an environment capable of running that build
 * How to automatically configure a build environment for given build job specification.
 * VMs have to be built with enough memory capable of building jobs in the spec file
 * How to take in command line arguments in JS and use them throughout the program

### What We Didn't Get To
 * Specifying the build version numbers for each build
 * Storing build specs that are built dynamically inside a folder along with its build version number
