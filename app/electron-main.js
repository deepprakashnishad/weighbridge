const { app, BrowserWindow } = require('electron');
const { electron } = require('process');
const url = require('url');
const path = require('path');
require("./db-service.js");
require("./my-port-reader.js");
require("./printer-service.js");

const env = "DEV"; // DEV Or PROD

global.win;

app.allowRendererProcessReuse = false

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false 
    }
  })
  win.maximize();
  win.show();

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
    win.setMenu(null);
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
