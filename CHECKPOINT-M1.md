# Check Point 1

## Completed Work:
* Automatically provision and configure a build server(100% done) - Hossam
* Create a build job specification(80% done, remaining work discussed below) - Hossam and Jesse
* Automatically configure a build environment for build job specification(80% done, remaining work discussed below) - Hossam and Nolan

## Issues Faced:
* Having to edit the application.yml with our credentials
* mysql driver was deprecated, we had to update the application.yml to fix this

## Remaining Work:
* Create a build job specification
Secrets are currently hardcoded in build.yml. Will need to use .env -> Assigned to Nolan
* Automatically configure a build environment for given build job specification
Our build environment has to be made clean so it can run multiple times without problems -> Assigned to Jesse
Checks for OS platform specific tasks -> Assigned to Jesse
* Create M1 branch to hold snapshot
* Sample .env file
* Update README
* Screencast
