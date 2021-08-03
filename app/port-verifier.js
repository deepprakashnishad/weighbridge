const { ipcMain } = require("electron");
const serialPort = require('serialport');
const Readline = require('@serialport/parser-readline')
const ByteLength = require('@serialport/parser-byte-length')
const log = require('electron-log');

log.transports.file.level = 'info';
log.transports.file.file = __dirname + 'log.log';

var weighString;
var tempPort;

ipcMain.handle("get-available-ports", async (event, ...args) => {
  try {
    var ports = await serialPort.list();
    return ports;
  } catch (err) {
    log.error("Unable to read ports. Please see below error logged");
    log.error(err);
    return [];
  }
});

ipcMain.handle("verify-port", async (event, ...args) => {
  if (args[1]['type'] === "serial") {

    try {
      weighString = args[1]['weighString'];
      tempPort = serialPort(args[1]['comPort'], {
        "baudRate": weighString['baudRate'],
        "dataBits": weighString['dataBits'],
        "stopBits": weighString['stopBits'],
        "parity": weighString['parity'].toString().toLowerCase(),
        "flowControl": weighString['flowControl'],
        autoOpen: false
      });
    } catch (err) {
      log.error(err);
      win.webContents.send("verification-weight-recieved", ["Port initialization failed"]);
    }
    tempPort.open();

    if (weighString['delimeter'] === undefined || weighString['delimeter'] === null || weighString['delimeter'].length === 0) {
      console.log("Bytelength parser initialized");
      var parser = tempPort.pipe(new ByteLength({ length: weighString["totalChars"]}));
    } else {
      console.log("Readline parser initialized");
      var parser = tempPort.pipe(new Readline({ delimiter: '\r\n' }));
    }

    parser.on('data', onReadData);
    parser.on('error', function (err) {
      log.error(err);
      win.webContents.send("verification-weight-recieved", [err]);
    });
  }
});

function onReadData(data) {
  try {
    data = data.toString();
    if (weighString === undefined) {
      return;
    }

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
    console.log('Weight - ' + tempWeight);
    win.webContents.send("verification-weight-recieved", [{ weight: tempWeight, timestamp: (new Date()).getTime() }]);
  } catch (err) {
    log.error(err);
  }
}

ipcMain.handle("close-verification-port", async (event, ...args) => {
  tempPort.close();
})
