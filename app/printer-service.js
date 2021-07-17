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
  console.log(printers);
  return printers;
}

function createRecieptFile(content) {
  const fs = require('fs');
  try { fs.writeFileSync('reciept_for_print.txt', content, 'utf-8'); }
  catch (e) {
    console.log('Failed to save the file !');
    console.log(e);
  }
}

ipcMain.handle("printer-ipc", async (event, ...args) => {
  if (args[0] === "getPrinters") {
    return getPrinters();
  } else if (args[0] === "print") {
    createRecieptFile(args[2]);
    var command = args[1].replace("<filename>", "reciept_for_print.txt");
    const result = await runCommand(command);
    console.log(result);
  }
})
