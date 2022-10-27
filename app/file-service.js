const { ipcMain, app } = require('electron');
const fs = require('fs');
const bootstrapData = require("./bootstrap.js");
const axios = require('axios');
//const log = require('electron-log');
//log.transports.file.level = 'info';
//log.transports.file.file = __dirname + 'file-log.log';

var env_filepath = app.getPath('userData') +"\\" + bootstrapData.mConstants.appName;

ipcMain.handle("saveEnvironmentVars", async (event, arg) => {
  try {
    fs.mkdir(env_filepath, { recursive: true }, function (err) {
      if (err) {
        log.error(err);
        return cb(err);
      }

      fs.writeFileSync(env_filepath + "\\" + bootstrapData.mConstants.envFilename, JSON.stringify(arg[0]), 'utf-8');
      log.debug("File writing completed");
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
      log.debug("File entry removed");
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
        log.debug("Single entry saved to environment file.");
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

    log.debug("Licence saved successfully to " + filepath)
    return true;
  } catch (e) {
    log.error(e);
    return false;
  }
  
});

ipcMain.handle("getLicense", async (event, args) => {
  try {
    const dir = env_filepath + '\\notamedia';
    log.debug("Reading licence from - " + dir);
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

ipcMain.handle("writeToHtml", async (event, args) => {
  var path = app.getPath('userData') + "\\" + bootstrapData.mConstants.appName + "\\daily-reports";
  fs.mkdirSync(path, { recursive: true });
  var filename = "\\temp.html";
  try {
    fs.writeFileSync(path+filename, args, 'utf-8');
  } catch (e) {
    log.error(e);
  } finally {
    return `${path}/${filename}`;
  }
  //fs.mkdir(path, { recursive: true }, function (err) {
  //  if (err) return cb(err);
  
  //});
});

ipcMain.handle("captureImage", async (event, args) => {
  console.log(args);
  var basicAuth = 'Basic ' + Buffer.from(args['username'] + ':' + args['password']).toString('base64');
  // var basicAuth = 'Basic ' + new Buffer("admin"+ ':' + "NoPassword").toString('base64');
  console.log(args);
  var path = args['imagePath'];

  if(path===undefined || path===null || path===""){
    path = app.getPath('userData') + "\\" + bootstrapData.mConstants.appName+ "\\ticket-images\\"
  }else if(path.charAt(path.length-1) !== "\\"){
    path = path+"\\";
  }
  path = path+args['sub-folder'];
  fs.mkdirSync(path, {recursive: true});
  path = path+"\\"+args['filename'];
  let axiosConfig = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      'Authorization': basicAuth
    },
    responseType: "arraybuffer"
  };
  try{
    var response = await axios.get(args['pictureUrl'], axiosConfig);
    saveBlob(response.data, path);
    return {success: true, "path": path}
  }catch(err){
    log.error(err);
    return {success: false, "path": null}
  }
});

// ipcMain.handle("captureImage", async (event, args) => {
//   // var basicAuth = 'Basic ' + Buffer.from(args['user'] + ':' + args['password']).toString('base64');
//   var basicAuth = 'Basic ' + new Buffer("admin"+ ':' + "NoPassword").toString('base64');
//   console.log(args);
//   console.log(basicAuth);
//   let axiosConfig = {
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       'Authorization': basicAuth
//     },
//     responseType: "arraybuffer"
//   };
//   axios.get(args['pictureUrl'], axiosConfig)
//     .then(response => {
//       saveBlob(response.data, "d:/test.jpg");
//     })
//     .catch(error => {
//       console.log(error);
//     });
// });

ipcMain.handle("loadImage", async (event, args) => {
  if(args[0]===undefined){
    args[0] = "g:/test.jpg";
  }
  log.error("Image path - "+args[0]);
  var _img = fs.readFileSync(args[0]).toString('base64');
  //example for .png
  var _out = '<img width=200 height=200 src="data:image/png;base64,' + _img + '" />';
  return _out;
});

function saveBlob(blob, path) {
  var writer = fs.createWriteStream(path);
  fs.writeFile(path, blob, function (err) {
    if (err) {
      console.log(err);
    }
    console.log("Saved")
  });
}

function getHash(key, data){
  const crypto = require('crypto');
  return crypto.createHmac('sha256', key)
    .update(data)
    .digest('hex');
}
