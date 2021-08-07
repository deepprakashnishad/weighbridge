const { ipcMain } = require('electron');
const fs = require('fs');
const bootstrapData = require("./bootstrap.js");

ipcMain.handle("saveEnvironmentVars", async (event, arg) => {
  try {
    fs.writeFileSync(bootstrapData.mConstants.envFilename, JSON.stringify(arg[0]), 'utf-8');
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
      var data = fs.readFileSync(bootstrapData.mConstants.envFilename, 'utf-8');
      console.log(data);
      data = JSON.parse(data);
      data[arg[0]] = arg[1];

      console.log(JSON.stringify(data));
    }
    fs.writeFileSync(bootstrapData.mConstants.envFilename, JSON.stringify(data), 'utf-8');
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
    var data = fs.readFileSync(bootstrapData.mConstants.envFilename, 'utf-8');
    if (arg[0]) {
      return JSON.parse(data)[arg[0]];
    } else {
      return JSON.parse(data);
    }
  }
  catch (e) {
    console.log('Failed to save the file !');
    console.log(e);
    return false;
  }
});
