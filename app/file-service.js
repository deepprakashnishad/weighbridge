const { ipcMain, app } = require('electron');
const fs = require('fs');
const bootstrapData = require("./bootstrap.js");
const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.file.file = __dirname + 'file-log.log';

var env_filepath = app.getPath('userData') +"\\" + bootstrapData.mConstants.appName;

ipcMain.handle("saveEnvironmentVars", async (event, arg) => {
  try {
    fs.mkdir(env_filepath, { recursive: true }, function (err) {
      if (err) {
        log.error(err);
        return cb(err);
      }

      fs.writeFileSync(env_filepath + "\\" + bootstrapData.mConstants.envFilename, JSON.stringify(arg[0]), 'utf-8');
      log.info("File writing completed");
    });
    
    return true;
  }
  catch (e) {
    log.error(e);
    return false;
  }
});

ipcMain.handle("removeSingleEntry", async (event, arg) => {
  try {
    if (arg[0]) {
      var data = fs.readFileSync(env_filepath + "\\" + bootstrapData.mConstants.envFilename, 'utf-8');
      data = JSON.parse(data);
      delete data[arg[0]];
      fs.writeFileSync(env_filepath + "\\" + bootstrapData.mConstants.envFilename, JSON.stringify(data), 'utf-8');
      log.info("File entry removed");
      return true;
    } else {
      return false;
    }
  }
  catch (e) {
    log.error(e);
    return false;
  }
});

ipcMain.handle("saveSingleEnvVar", async (event, arg) => {
  try {
    if (arg[0] && arg[1]) {
      try {
        var data = fs.readFileSync(env_filepath + "\\" + bootstrapData.mConstants.envFilename, 'utf-8');
        data = JSON.parse(data);
      } catch (e) {
        var data = {};
        log.error(e);
      }
      data[arg[0]] = arg[1];
      fs.mkdir(env_filepath, { recursive: true }, function (err) {
        if (err) {
          log.error(err);
          return cb(err);
        }

        fs.writeFileSync(env_filepath + "\\" + bootstrapData.mConstants.envFilename, JSON.stringify(data), 'utf-8');
        log.info("Single entry saved to environment file.");
      });
      
      return true;
    } else {
      return false;
    }
  }
  catch (e) {
    log.error(e);
    return false;
  }
});

ipcMain.handle("loadEnvironmentVars", async (event, arg) => {
  try {
    var data = fs.readFileSync(env_filepath + "\\" + bootstrapData.mConstants.envFilename, 'utf-8');

    if (arg && arg[0]) {
      return JSON.parse(data)[arg[0]];
    } else {
      return JSON.parse(data);
    }
  }
  catch (e) {
    log.error(e);
    return false;
  }
});

ipcMain.handle("saveLicense", async (event, args) => {
  try {
    const dir = env_filepath + '\\notamedia';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      });
    }
    var filepath = `${dir}/${args[0]}`;
    fs.writeFileSync(filepath, "", 'utf-8');
    fs.writeFileSync(filepath, args[1], 'utf-8');
    var stats = fs.statSync(filepath);
    var birthtime = stats['birthtime'];
    var hash = getHash(args[0], birthtime.toISOString());
    fs.appendFileSync(`${dir}/${args[0]}`, "." + hash);

    log.info("Licence saved successfully to " + filepath)
    return true;
  } catch (e) {
    log.error(e);
    return false;
  }
  
});

ipcMain.handle("getLicense", async (event, args) => {
  try {
    const dir = env_filepath + '\\notamedia';
    log.info("Reading licence from - " + dir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      });
    }
    var data = fs.readFileSync(`${dir}/${args[0]}`, 'utf-8');
    var stats = fs.statSync(`${dir}/${args[0]}`);
    var birthtime = stats['birthtime'];
    var newHash = getHash(args[0], birthtime.toISOString());
    var lastIndex = data.lastIndexOf(".");
    var existingHash = data.substr(lastIndex + 1);
    if (newHash === existingHash) {
      var token = data.substr(0, lastIndex);
      return token;
    } else {
      return false;
    }
  } catch (e) {
    log.error(e);
    return false;
  }
});

ipcMain.handle("removeLicense", async (event, args) => {
  const dir = env_filepath + '\\notamedia';
  var filepath = `${dir}/${args[0]}`;
  try {
    fs.rmSync(filepath);
  } catch (e) {
    console.log(e);
  }  
});

ipcMain.handle("writeToExcel", async (event, args) => {
  var path = app.getPath('userData') + "\\" + bootstrapData.mConstants.appName + "\\daily-reports";
  fs.mkdirSync(path, { recursive: true });
  var filename = args[0]['filename'];
  try {
    var xl = require('excel4node');
    var wb = new xl.Workbook();

    var ws = wb.addWorksheet('Sheet 1');
    var headers = args[0]['headers'];
    var keys = Object.keys(headers);

    for (var i = 0; i < keys.length; i++) {
      ws.cell(1, i + 1).string(keys[i]);
    }
    for (var i = 0; i < args[0]['data'].length; i++) {
      for (var j = 0; j < keys.length; j++) {
        if (headers[keys[j]] === "sNo") {
          ws.cell(i + 2, j + 1).number(i + 1);
        } else if (args[0]['data'][i][headers[keys[j]]]) {
          ws.cell(i + 2, j + 1).string(args[0]['data'][i][headers[keys[j]]].toString());
        }
      }
    }
  } catch (e) {
    log.error(e);
  } finally {
    wb.write(`${path}/${filename}`);
    return { filename: filename, fullpath: `${path}/${filename}` };
  }
  //fs.mkdir(path, { recursive: true }, function (err) {
  //  if (err) return cb(err);
    
  //});
});

function getHash(key, data){
  const crypto = require('crypto');
  return crypto.createHmac('sha256', key)
    .update(data)
    .digest('hex');
}
