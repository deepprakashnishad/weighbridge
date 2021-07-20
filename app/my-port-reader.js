const { ipcMain } = require("electron");
const serialPort = require('serialport');

var tempWeight = "";
var currWeight = "";
var startReadingWeight = false;

serialPort.list().then((ports, err) => {
  if (err) {
    console.log(err.message);
    return;
  }
  console.log('ports', ports);
});

var port;

port = serialPort("COM3", {
  baudRate: 2400,
});

port.on('data', onData);

ipcMain.handle("serial-port-ipc", async (event, ...args) => {
  if (args[0] === "initialiaze-port") {
    initialiazePort(args[1]['type'], args[1]['comPort'], args[1]['baudRate']);
  }
});

ipcMain.handle("verify-port", async (event, ...args) => {
  if (args[1]['type'] === "serial") {
    port = serialPort(args[1]['comPort'], {
      baudRate: args[1]['baudRate'],
    });

    port.on('data', (data) => {
      stringParser(data, args[0]);
    });
  }
});

function initialiazePort(type, portPath, baudRate) {
  if (type === "serial") {
    port = serialPort(portPath, {
      baudRate: baudRate,
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
    console.log(`Main channel: ${currWeight}`);
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
    console.log("Verification channel" + currWeight);
  }
}
