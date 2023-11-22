Dependencies

Node - 15.14.0
nvm - 1.1.11

Pre-requisite

1. Visual studio is installed
2. Visual Studio C++ module is needed
3. Python 3.9.7 is installed

Steps for installation

1. Run "npm install" in root directory. In case install is stuck remove electron related dependencies and then install other dependencies. Include electron related dependencies again and install them.
2. Run "npm install" in app directory
3. Run "npm run rebuild" to rebuild dependencies inside app folder. This will remove error @serialport module is compiled with different NODE_MODULE_VERSION.
4. Run "npm run rebuild" to rebuild dependencies inside root folder

//To run in development mode
1. Run "npm run start" in one window
2. Ensure in app/electron-main.js "env" is set DEV
3. Run "npm run electron-start" in other window.

//To build project for distribution
1. Ensure in app/electron-main.js "env" is set PROD
2. Run "npm run distc" command.

Note - While rebuilding inside app folder error can come but you must give a shot to run the application. In this build, error is present while running step 3 of Steps for installation but build has been distributed to the client and it is working.