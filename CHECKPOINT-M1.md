# Check Point 1

## Completed Work:
* Automatically provision and configure a build server(90% done, remaining work discussed below) - Hossam
  * ![Task1 - init](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-37/blob/main/images/Task1_init.png) 
* Create a build job specification(80% done, remaining work discussed below) - Hossam and Jesse
  * ![Task2 - YAML](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-37/blob/main/images/Task2_yaml.png) 
* Automatically configure a build environment for build job specification(80% done, remaining work discussed below) - Hossam and Nolan
  * ![Task3 - Automation of build](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-37/blob/main/images/Task3_Automation.png) 

## Issues Faced:
* Having to edit the application.yml with our credentials
* mysql driver was deprecated, we had to update the application.yml to fix this
* Currently running to error running iTrust2 tests
  * ![Task2 - iTrust2 Tests Fail](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-37/blob/main/images/Task2_iTrust2_Tests_Fail.png) 


## Remaining Work:
* Automatically provision and configure a build server
  * Add check to ensure bakerx is installed
  * Add check to make sure image pull is successful
* Create a build job specification
  * Secrets are currently hardcoded in build.yml. Will need to use .env -> Assigned to Nolan
* Automatically configure a build environment for given build job specification
  * We get to the last step of running iTrust2, however we are currently not passing the tests due to "Error starting ApplicationContext" -> Assigned to Jesse
  * Our build environment has to be made clean so it can run multiple times without problems -> Assigned to Jesse
  * Checks for OS platform specific tasks -> Assigned to Jesse
* Create M1 branch to hold snapshot
* Sample .env file
* Update README
* Screencast
