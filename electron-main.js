const { app, BrowserWindow, ipcMain } = require('electron');
const { electron } = require('process');
const url = require('url');
const path = require('path');

const mysql = require('mysql');

const env = "PROD"; // DEV Or PROD

var indexFilePath = "./dist/angular-build/index.html";
if(env === "DEV"){
  indexFilePath = "./src/index.html";
}

var connection = mysql.createConnection({
  host     : 'remotemysql.com',
  user     : 'qpprF0nLD8',
  password : 'a5uhzM6Rcl',
  database : 'qpprF0nLD8'
});

let win;

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
  // win.setMenu(null);

  win.webContents.on('did-fail-load', () => {
    win.loadURL(url.format({
      pathname: path.join(__dirname, indexFilePath),
      protocol: 'file:',
      slashes: true
    }));// REDIRECT TO FIRST WEBPAGE AGAIN
  });

  win.loadFile(indexFilePath)

  win.webContents.getPrinters();
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

function getPrinters(){
  var printers = win.webContents.getPrinters();
  return printers;
}

ipcMain.handle("sync-invokable-ipc", async (event, ...args)=>{
  if(args[0] === "getPrinters"){
    return getPrinters();
  }
})

ipcMain.on("executeDBQuery", (event, arg)=>{
  connection.connect();
  connection.query(arg[1], function (error, results, fields) {
    if (error) throw error;
    console.log("Going to execute query");
    event.sender.send("db-reply", [arg[0], results]);
  });
  connection.end();

  //Synchronous channel handling
  
  /* connection.connect();
  connection.query(arg[1], function (error, results, fields) {
    if (error) throw error;
    event.returnValue = results;
  });
  connection.end(); */
})