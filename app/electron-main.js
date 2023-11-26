const { app, BrowserWindow, ipcMain } = require('electron');
const os = require("os");
const url = require('url');
const path = require('path');
const machine = require("node-machine-id");

global.log = require('electron-log');
global.logLevel = "error";
log.transports.file.file = __dirname + 'master_log.log';
log.transports.console.level = "error";
log.transports.file.level = 'error';

require("./db-service.js");

require("./my-port-reader.js");

require("./printer-service.js");
require("./file-service.js");
require("./port-verifier.js");
require("./mailer.js");
require("./sap-integration.js");

const appName = "Accubridge"
const version = "1.0.3";
const env = "PROD"; // DEV Or PROD
// const env = "DEV";

global.win;

app.allowRendererProcessReuse = false

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      disableBlinkFeatures: 'BlockCredentialedSubresources'
    }
  })
  win.maximize();
  win.once('ready-to-show', () => {
    win.show()
  })

  win.webContents.on('did-fail-load', () => {
    if (env === "DEV") {
      win.loadURL('http://localhost:4200');
    } else {
      win.loadURL(url.format({
        pathname: path.join(__dirname, "./dist/index.html"),
        protocol: 'file:',
        slashes: true
      }));
    }    
  });
  
  if (env === "DEV") {
    win.loadURL('http://localhost:4200');
  } else {
    //win.setMenu(null);
    win.loadFile("./dist/index.html");
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle("getMachineDetails", async (event, arg) => {
  try {
    var machineId = await machine.machineId(true);
    var platform = os.platform();
    return {
      "os": platform,
      "machineId": machineId
    };
  }
  catch (e) {
    log.error(e);
    return {
      "os": "windows",
      "machineId": "machine-id-not-found"
    };
  }
});

ipcMain.handle("getAppInfo", async (event, arg) => {
  try {
    //var appName = app.getName();
    //var version = app.getVersion();
    return {
      "name": appName,
      "version": version,
      "env": env
    };
  }
  catch (e) {
    log.error(e);
    return false;
  }
});

ipcMain.handle("updateLogLevel", async (event, arg) => {
  try {
    log.transports.console.level = arg[0];
    log.transports.file.level = arg[0];
    logLevel = arg[0];
  }
  catch (e) {
    log.error(e);
  }
});
