const { ipcMain } = require("electron");
const serialPort = require('serialport');
const Readline = require('@serialport/parser-readline')
const ByteLength = require('@serialport/parser-byte-length')
const log = require('electron-log');

log.transports.file.level = 'info';
log.transports.file.file = __dirname + 'log.log';

var weighString;
var tempPort;
var isPortInUse = false;

ipcMain.handle("initialize-port", async (event, ...args) => {
  if (args[1]['wiType'] === "serial") {
    try {
      if (tempPort?.isOpen) {
        tempPort.close();
      }
    } catch (err) {
      log.error(err);
    }
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
      win.webContents.send("curr-weight-recieved", ["Port initialization failed"]);
    }

    tempPort.on("open", function () {
      isPortInUse = true;
    })
    tempPort.on("close", function () {
      isPortInUse = false;
    })
    if (isPortInUse===false) {
      initializePort();
    }
      
  }
});

function initializePort() {
  try {
    tempPort.open();
    if (weighString['delimeter'] === undefined
      || weighString['delimeter'] === null
      || weighString['delimeter'].length === 0) {
      var parser = tempPort.pipe(new ByteLength({ length: weighString["totalChars"] }));
    } else {
      var parser = tempPort.pipe(new Readline({ delimiter: '\r\n' }));
    }

    parser.on('data', onReadData);
    parser.on('error', function (err) {
      log.error(err);
      win.webContents.send("curr-weight-recieved", [err]);
    });
  } catch (err) {

  } 
}

ipcMain.handle("write-to-port", async (event, ...args) => {
  if (args[0] && !isNaN(args[0])) {
    tempPort.write(String.fromCharCode(args[0]));
  } else if (args[0] && isNaN(args[0])) {
    tempPort.write(args[0]);
  } else {
    tempPort.write(String.fromCharCode(05));
  }
});

function onReadData(data) {
  try {
    data = data.toString();
    console.log(data);
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
    win.webContents.send("curr-weight-recieved", [{ weight: tempWeight, timestamp: (new Date()).getTime() }]);
  } catch (err) {
    log.error(err);
  }
}

ipcMain.handle("close-port", async (event, ...args) => {
  if (tempPort.isOpen)
    tempPort.close();
})
