const { ipcMain } = require("electron");
const serialPort = require('serialport');
const Readline = require('@serialport/parser-readline')

var tempWeight = "";
var currWeight = "";
var startReadingWeight = false;
var mports = [];
var port;

serialPort.list().then((ports, err) => {
  if (err) {
    console.log(err.message);
    return;
  }
  mports = ports;
  console.log(mports);
  if (mports.length > 0) {
    setTimeout(function () {
      initialiazePort("serial", mports[0]['path'], env_data['weighString']['baudRate'], env_data['weighString']['dataBits'],
        env_data['weighString']['stopBits'], env_data['weighString']['parity']);
    }, 500);
  }  
});

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

ipcMain.handle("serial-port-ipc", async (event, ...args) => {
  if (args[0] === "initialiaze-port") {
    serialPort.list().then((ports, err) => {
      if (err) {
        console.log(err.message);
        return;
      }
      mports = ports;
      initialiazePort("serial", mports[0]['path'], env_data['weighString']['baudRate'], env_data['weighString']['dataBits'],
        env_data['weighString']['stopBits'], env_data['weighString']['parity']);
    });
  }
});

ipcMain.handle("verify-port", async (event, ...args) => {
  if (args[1]['type'] === "serial") {
    try {
      var tempPort = serialPort(args[1]['comPort'], {
        "baudRate": args[1]['baudRate'],
        "dataBits": args[1]['dataBits'],
        "stopBits": args[1]['stopBits'],
        "parity": args[1]['parity'].toString().toLowerCase()
      });
    } catch (err) {
      console.log(err);
    }
    tempPort.on('data', onData);

    tempPort.on('error', function (err) {
      console.log("Error recieved");
      console.log(err);
      win.webContents.send(args[0], [err]);
    });
  }
});

function initialiazePort(type, portPath, baudRate, dataBits, stopBits, parity) {
  if (type === "serial") {
    port = serialPort(portPath, {
      "baudRate": baudRate,
      "dataBits": dataBits,
      "stopBits": stopBits,
      "parity": parity.toString().toLowerCase()
    });
    var parser = port.pipe(new Readline({ delimiter: '\r\n' }));
    parser.on('data', onData);
    parser.on('error', function (err) {
      log.error(err);
      win.webContents.send("curr-weight-recieved", [err]);
    });
  }
}

function onData(data) {
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

  if (weighString['weightCharPosition6'] !== null) {
    tempWeight = tempWeight + data.charAt(weighString['weightCharPosition6']);
  }

  //console.log("Weight - " + tempWeight);
  win.webContents.send("curr-weight-recieved", [tempWeight]);
}
