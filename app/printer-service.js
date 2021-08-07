const { app, ipcMain } = require("electron");
const { getPrinter } = require("printer");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function runCommand(command) {
  const { stdout, stderr, error } = await exec(command);
  if (stderr) { console.error('stderr:', stderr); }
  if (error) { console.error('error:', error); }
  return stdout;
}

function getPrinters() {
  var printers = win.webContents.getPrinters();
  //console.log(printers);
  return printers;
}

ipcMain.handle("printer-ipc", async (event, ...args) => {
  if (args[0] === "getPrinters") {
    return getPrinters();
  } else if (args[0] === "print") {
    await runCommand(args[1]);
  }
})
