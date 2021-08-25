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

ipcMain.handle("removeSingleEntry", async (event, arg) => {
  console.log(arg);
  try {
    if (arg[0]) {
      var data = fs.readFileSync(bootstrapData.mConstants.envFilename, 'utf-8');
      data = JSON.parse(data);
      delete data[arg[0]];
      console.log(JSON.stringify(data));
      fs.writeFileSync(bootstrapData.mConstants.envFilename, JSON.stringify(data), 'utf-8');
      return true;
    } else {
      return false;
    }
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
      data = JSON.parse(data);
      data[arg[0]] = arg[1];
      console.log(JSON.stringify(data));
      fs.writeFileSync(bootstrapData.mConstants.envFilename, JSON.stringify(data), 'utf-8');
      return true;
    } else {
      return false;
    }
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
    if (arg && arg[0]) {
      return JSON.parse(data)[arg[0]];
    } else {
      return JSON.parse(data);
    }
  }
  catch (e) {
    console.log('Failed to load the file !');
    console.log(e);
    return false;
  }
});

ipcMain.handle("saveLicense", async (event, args) => {
  try {
    const dir = './notamedia';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      });
    }
    var filepath = `${dir}/${args[0]}`;
    console.log(args);
    fs.writeFileSync(filepath, "", 'utf-8');
    fs.writeFileSync(filepath, args[1], 'utf-8');
    var stats = fs.statSync(filepath);
    console.log(stats);
    var birthtime = stats['birthtime'];
    var hash = getHash(args[0], birthtime.toISOString());
    fs.appendFileSync(`${dir}/${args[0]}`, "." + hash);

    var stats = fs.statSync(filepath);
    console.log(stats);
    return true;
  } catch (e) {
    return false;
  }
  
});

ipcMain.handle("getLicense", async (event, args) => {
  const dir = './notamedia';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }
  var data = fs.readFileSync(`${dir}/${args[0]}`, 'utf-8');
  var stats = fs.statSync(`${dir}/${args[0]}`);
  console.log(stats);
  var birthtime = stats['birthtime'];
  var newHash = getHash(args[0], birthtime.toISOString());
  var lastIndex = data.lastIndexOf(".");
  var existingHash = data.substr(lastIndex + 1);
  console.log(existingHash);
  console.log(newHash);
  if (newHash === existingHash) {
    var token = data.substr(0, lastIndex);
    return token;
  } else {
    return false;
  }
});

function getHash(key, data){
  const crypto = require('crypto');
  return crypto.createHmac('sha256', key)
    .update(data)
    .digest('hex');
}
