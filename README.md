Dependencies

Node - 15.14.0
nvm - 1.1.11

Pre-requisite

1. Visual studio is installed. Visual Studio version used is 2019.
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

Ensure env file is present in the location printed in console in dev mode and app_asar_log.log under resources folder in production mode.

Note - While rebuilding inside app folder error can come but you must give a shot to run the application. In this build, error is present while running step 3 of Steps for installation but build has been distributed to the client and it is working.


Application Configuration

1. Click on Initial Load Data. Enter details of database.
2. Enter license number and click on Activate button.
3. Click on "Load Initial Data". This will take sometime. Wait for the process to complete and then you will be given a success message on successful loading. In case it is not working then check log for database error and ensure if database is connected properly or not.


Application configuration

1. Login into the application with credenatials. admin/Admin123
2. To setup search based fields go to "Administration > Data Setup". Select "Search Fields" tab. Click on Edit icon. and then click on "Save" button. This is required once to load the field on form.





Please find below prerequisites and steps to setup accubridge.

Prerequisites:

1. Python 3.7 or above is required if you wish to use  dot-matrix printers.. Path of python should be set in the environment variables path.
To check this simply run "python --version" in the command prompt and as output it should show the python version installed.

2. Microsoft SQL(MSSQL) Server database(not to be older than 2012). This server can be on the same machine or any other machine with access to the machine on which software is being installed.
A SQL user with  SQL  authentication needs to be created for the database. Please verify that this is user is able to connect to database using  SQL  authentication.

How to create new SQL user. Refer to following article

https://support.esri.com/en-us/knowledge-base/how-to-create-a-sql-server-authenticated-user-in-micro-000009958

After creating user if unable to connect to database then please refer to following article.
https://help.dugeo.com/m/Insight/l/438913-troubleshooting-enabling-tcp-ip-in-the-sql-server

3. Following URL needs to be made accessible from the machine to activate licence
https://license-manager.onrender.com

4. Trial licence
 616e-9958-8141-3800-1620-1feb

Steps for setup

1. Download the software from the below link:

32-bit architecture
https://drive.google.com/file/d/1Tc3P6_hkL7sKsKt3OXvnkigL3KXrPPx3/view?usp=sharing


64-bit architecture
https://drive.google.com/file/d/1Z5EJ0rpO3_GT6nFH_ef2O7JYrklWc34s/view?usp=sharing



2. Extract the files into a folder. Navigate to folder inside. Create a shortcut of Accubridge.exe so that it is easily accessible by operators.

Run the Accubridge.exe

3.  Click on "Initial Data" button. Enter licence number and click on Activate button. It will take sometime.