const { ipcMain } = require("electron");
const serialPort = require('serialport');

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
  console.log('ports', ports);
  port = serialPort(mports[0]['path'], {
    baudRate: 2400,
  });

  port.on('data', onData);
});



ipcMain.handle("serial-port-ipc", async (event, ...args) => {
  if (args[0] === "initialiaze-port") {
    serialPort.list().then((ports, err) => {
      if (err) {
        console.log(err.message);
        return;
      }
      mports = ports;
      console.log('ports', ports);
      port = serialPort(mports[0]['path'], {
        baudRate: 2400,
      });

      port.on('data', onData);
    });
    //initialiazePort(args[1]['type'], args[1]['comPort'], args[1]['baudRate']);
  }
});

ipcMain.handle("verify-port", async (event, ...args) => {
  if (args[1]['type'] === "serial") {
    try {
      console.log("Initializing port");
      port = serialPort(args[1]['comPort'], {
        baudRate: args[1]['baudRate'],
      });
      console.log(port);
    } catch (err) {
      console.log(err);
    }
    port.on('data', (data) => {
      console.log(data);
      stringParser(data, args[0]);
    });

    port.on('error', function (err) {
      console.log("Error recieved");
      console.log(err);
      win.webContents.send(args[0], [err]);
    });
  }
});

function initialiazePort(type, portPath, baudRate) {
  if (type === "serial") {
    port = serialPort(portPath, {
      baudRate: baudRate,
    });
    port.on('data', onData);
    port.on('error', function (err) {
      console.log("Error recieved");
      console.log(err);
      win.webContents.send("curr-weight-recieved", [err]);
    });
  }
}

function onData(data) {
  if (data.toString().charCodeAt(0) === 2) {
    startReadingWeight = true;
  }
  if (startReadingWeight && data.toString().charCodeAt(0) !== 2 && data.toString().charCodeAt(0) !== 3) {
    tempWeight = tempWeight.concat(String.fromCharCode(data.toString().charCodeAt(0)));
  }
  if (data.toString().charCodeAt(0) === 3) {
    currWeight = tempWeight;
    tempWeight = "";
    if (currWeight.charAt(0) === "\r") {
      currWeight = currWeight.slice(3);
    }
    win.webContents.send("curr-weight-recieved", [currWeight]);
    //console.log(`Main channel: ${currWeight}`);
  }
}

function stringParser(data, channelName) {
  if (data.toString().charCodeAt(0) === 2) {
    startReadingWeight = true;
  }
  if (startReadingWeight && data.toString().charCodeAt(0) !== 2 && data.toString().charCodeAt(0) !== 3) {
    tempWeight = tempWeight.concat(String.fromCharCode(data.toString().charCodeAt(0)));
  }
  if (data.toString().charCodeAt(0) === 3) {
    currWeight = tempWeight;
    tempWeight = "";
    win.webContents.send(channelName, [currWeight]);
    //console.log("Verification channel" + currWeight);
  }
}
