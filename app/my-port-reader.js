const { ipcMain } = require("electron");
const serialPort = require('serialport');
const Readline = require('@serialport/parser-readline')
const ByteLength = require('@serialport/parser-byte-length')

const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.file.file = __dirname + 'log.log';

var currWeight = "";
var startReadingWeight = false;
var weighbridgeName;

ipcMain.handle("serial-port-ipc", async (event, ...args) => {
  if (args[0] === "initialiaze-port") {
    serialPort.list().then((ports, err) => {
      if (err) {
        log.error(err);
        return;
      }
      mports = ports;
      initialiazePort("serial", env_data['weighString']['comPort'], env_data['weighString']['baudRate'],
        env_data['weighString']['dataBits'], env_data['weighString']['stopBits'],
        env_data['weighString']['parity'], env_data['weighString']['delimeter'], env_data['weighString']['totalChars']);
    });
  }
});

function initialiazePort(type, portPath, baudRate, dataBits, stopBits, parity, delimeter, totalChars) {
  try {
    if (type === "serial") {
      port = serialPort(portPath, {
        "baudRate": baudRate,
        "dataBits": dataBits,
        "stopBits": stopBits,
        "parity": parity.toString().toLowerCase(),
      });

      if (delimeter === undefined || delimeter === null || delimeter.length === 0) {
        console.log("Invoking byte length parse");
        var parser = port.pipe(new ByteLength({ length: totalChars }));
        parser.on('data', onReadline);
        parser.on('error', function (err) {
          log.error(err);
          win.webContents.send("curr-weight-recieved", [err]);
        });
      } else {
        console.log("Invoking readline parser");
        var parser = port.pipe(new Readline({ delimiter: '\r\n' }));
        parser.on('data', onReadline);
        parser.on('error', function (err) {
          log.error(err);
          win.webContents.send("curr-weight-recieved", [{weighbridgeName: { weight: err, timestamp: (new Date().getTime()) }}]);
        });
      }
      parser.on('close', function () {
        console.log("Port got closed");
      });
    }
    log.info("Initialization complete");
  } catch (err) {
    log.error(err);
  }
}

function onReadline(data) {
  try {
    data = data.toString();
    if (env_data['weighString'] === undefined) {
      return;
    }

    var weighString = env_data['weighString'];

    var tempWeight = '';

    if (data.charCodeAt(weighString['signCharPosition']) === weighString['negativeSignValue'] ||
      data.charAt(weighString['signCharPosition']) === weighString['negativeSignValue']) {
      tempWeight = '-';
    }

    if (weighString['weightCharPosition1'] !== null) {
      tempWeight = tempWeight + data.charAt(weighString['weightCharPosition1']);
    }

    if (weighString['weightCharPosition2'] !== null) {
      tempWeight = tempWeight + data.charAt(weighString['weightCharPosition2']);
    }

    if (weighString['weightCharPosition3'] !== null) {
      tempWeight = tempWeight + data.charAt(weighString['weightCharPosition3']);
    }

    if (weighString['weightCharPosition4'] !== null) {
      tempWeight = tempWeight + data.charAt(weighString['weightCharPosition4']);
    }

    if (weighString['weightCharPosition5'] !== null) {
      tempWeight = tempWeight + data.charAt(weighString['weightCharPosition5']);
    }

    if (weighString['weightCharPosition6'] && weighString['weightCharPosition6'] !== null) {
      tempWeight = tempWeight + data.charAt(weighString['weightCharPosition6']);
    }

    //console.log("Weight - " + tempWeight);
    console.log(`Weighbridge - ${weighbridgeName}`);
    win.webContents.send("curr-weight-recieved", [{ weighbridgeName: { weight: tempWeight, timestamp: (new Date().getTime()) }}]);
  } catch (err) {
    log.error(err);
  }
}


function onData(data) {
  log.info(data.toString());
  if (data.toString().charCodeAt(0) === 2) {
    startReadingWeight = true;
    if (env_data['weighString'] === undefined) {
      return;
    }
    if (startReadingWeight && data.toString().charCodeAt(0) !== 2 && data.toString().charCodeAt(0) !== 3) {
      tempWeight = tempWeight.concat(String.fromCharCode(data.toString().charCodeAt(0)));

      var weighString = env_data['weighString'];

      var tempWeight = '';

      if (data.charCodeAt(weighString['signCharPosition']) === weighString['negativeSignValue'] ||
        data.charAt(weighString['signCharPosition']) === weighString['negativeSignValue']) {
        tempWeight = '-';
      }
      if (data.toString().charCodeAt(0) === 3) {
        currWeight = tempWeight;
        tempWeight = "";
        if (currWeight.charAt(0) === "\r") {
          currWeight = currWeight.slice(3);
        }
        win.webContents.send("curr-weight-recieved", [currWeight]);
        log.info(`Main channel: ${currWeight}`);
      }
    }
  }
}


//port.on('data', onData);
//port.on('error', function (err) {
//  log.error(err);
//  console.log("Haribol ho gaya")
//  win.webContents.send("curr-weight-recieved", [err]);
//});
