const { ipcMain } = require("electron");
const serialPort = require('serialport');

const {ReadlineParser} = require('@serialport/parser-readline')
const {ByteLengthParser} = require('@serialport/parser-byte-length')

//const log = require('electron-log');
//log.transports.file.level = 'info';
//log.transports.file.file = __dirname + 'port-reader.log';

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
      log.debug(args[1]['comPort']);
      tempPort = new serialPort.SerialPort({
        "path": args[1]['comPort'],
        "baudRate": weighString['baudRate'],
        "dataBits": weighString['dataBits'],
        "stopBits": weighString['stopBits'],
        "parity": weighString['parity'].toString().toLowerCase(),
        "flowControl": weighString['flowControl'],
        autoOpen: false
      });

      tempPort.on("open", function () {
        log.debug("Port opened successfully");
        isPortInUse = true;
      })
      tempPort.on("close", function () {
        log.debug("Port closed successfully");
        isPortInUse = false;
      })

      tempPort.on("error", function () {
        log.error("Error occured on port");
        win.webContents.send("curr-weight-recieved", ["Port initialization failed"]);
      });

      if (isPortInUse === false) {
        initializePort();
      }
    } catch (err) {
      log.error(err);
      win.webContents.send("curr-weight-recieved", ["Port initialization failed"]);
    }      
  }
});

function initializePort() {
  try {
    tempPort.open();
    if (weighString['delimeter'] === undefined
      || weighString['delimeter'] === null
      || weighString['delimeter'].length === 0) {
      var parser = tempPort.pipe(new ByteLengthParser({ length: weighString["totalChars"] }));
    } else {
      var parser = tempPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    }

    parser.on('data', onReadData);
    parser.on('error', function (err) {
      log.error(err);
      win.webContents.send("curr-weight-recieved", [err]);
    });
    log.debug("Port initialization complete");
  } catch (err) {
    log.error(err);
  } 
}

ipcMain.handle("write-to-port", async (event, ...args) => {
  try {
    if (args[0] && !isNaN(args[0])) {
      tempPort.write(String.fromCharCode(args[0]));
    } else if (args[0] && isNaN(args[0])) {
      tempPort.write(args[0]);
    } else {
      tempPort.write(String.fromCharCode(05));
    }
  } catch (e) {
    log.error(e);
  }
});

function onReadData(data) {
  try {
    data = data.toString();
    if (weighString === undefined) {
      return;
    }
    var tempWeight = '';

    if (data.length !== weighString['totalChars'] && weighString['variableLength'] === 0) {
      log.silly("Weigh string data length - " + data.length);
      log.silly("Expected Chars - "+weighString['totalChars']);
      return;
    }

    if (weighString['variableLength'] == 0) {
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
    } else {
      var weighStartFlag = false;
      log.silly("Printing Charters");
      for (var i = 0; i < data.length; i++) {
        log.silly(data.charAt(i));
        if (data.charCodeAt(i) == 32 || data.charCodeAt(i) == 0 || data.charCodeAt(i) == 2) {
          continue;
        }
        if ((48 <= data.charCodeAt(i) && data.charCodeAt(i) <= 57) || (data.charCodeAt(i) == 45 && weighStartFlag == false)) {
          weighStartFlag = true;
          tempWeight = tempWeight + data.charAt(i);
        } else if (weighStartFlag === true && (48 >= data.charCodeAt(i) || data.charCodeAt(i) >= 57)) {
          break;
        }
      }
    }
    win.webContents.send("curr-weight-recieved", [{ weight: tempWeight, timestamp: (new Date()).getTime() }]);
  } catch (err) {
    log.error(err);
  }
}

ipcMain.handle("close-port", async (event, ...args) => {
  if (tempPort.isOpen)
    tempPort.close();
});

ipcMain.handle("close-port-if-path-is", async (event, ...args) => {
  if (tempPort && args[0] === tempPort['path'] && tempPort.isOpen) {
    tempPort.close();
  }
});

ipcMain.handle("is-port-open", async (event, ...args) => {
  if (tempPort) {
    return tempPort.isOpen;
  } else {
    return false;
  }
  
});
