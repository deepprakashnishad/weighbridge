const { ipcMain } = require('electron');
const fs = require('fs');

ipcMain.handle("saveEnvironmentVars", async (event, arg) => {
  try {
    fs.writeFileSync("env.txt", JSON.stringify(arg[0]), 'utf-8');
    return true;
  }
  catch (e) {
    console.log('Failed to save the file !');
    console.log(e);
    return false;
  }
});

ipcMain.handle("saveSingleEnvVar", async (event, arg) => {
  try {
    if (arg[0] && arg[1]) {
      var data = fs.readFileSync("env.txt", 'utf-8');
      data = JSON.parse(data);
      data[arg[0]] = arg[1];
    }
    fs.writeFileSync("env.txt", JSON.stringify(data), 'utf-8');
    return true;
  }
  catch (e) {
    console.log('Failed to save the file !');
    console.log(e);
    return false;
  }
});

ipcMain.handle("loadEnvironmentVars", async (event, arg) => {
  try {
    var data = fs.readFileSync("env.txt", 'utf-8');
    return JSON.parse(data);
  }
  catch (e) {
    console.log('Failed to save the file !');
    console.log(e);
    return false;
  }
});
