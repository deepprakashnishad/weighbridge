const { BrowserWindow, ipcMain, shell } = require("electron");
const { getPrinter } = require("printer");
const fs = require('fs')
const path = require('path')
const os = require('os')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const bootstrap = require("./bootstrap");

const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.file.file = __dirname + 'print-log.log';

async function runCommand(command) {
  console.log(command);
  const { stdout, stderr, error } = await exec(command);
  if (stderr) { console.error('stderr:', stderr); }
  if (error) { console.error('error:', error); }
  return stdout;
}

function getPrinters() {
  var printers = win.webContents.getPrinters();
  return printers;
}

ipcMain.handle("printer-ipc", async (event, ...args) => {
  if (args[0] === "getPrinters") {
    return getPrinters();
  } else if (args[0] === "print") {
    await runCommand(args[1]);
  } else if (args[0] === "print-file") {
    var filename = "temp_file_for_print.txt";
    createPrintFile(filename, args[2]);
    var command = args[1].replace("<filename>", filename);
    const result = await runCommand(command);
    fs.unlink(filename, function () { console.log('Deleted avatar') });
    console.log(result);
  }
})

ipcMain.handle("graphical-print-ipc", async (e, ...args) => {
  let window = BrowserWindow.fromWebContents(e.sender);
  if (args[0]['name'].indexOf("PDF") > -1) {
    try {
      window.webContents.printToPDF({
        printSelectionOnly: true,
        landscape: true,
      }).then((data) => {
        const pdfPath = path.join(os.homedir(), `Desktop/${bootstrap.mConstants.appName}/${args[2]}.pdf`)
        fs.writeFile(pdfPath, data, (error) => {
          if (error) throw error
          shell.openExternal('file://' + pdfPath);
        })
      });
    } catch (e) {
      log.error(e);
    }
    
  } else {
    window.webContents.print();
  }  
});

ipcMain.handle("cmdline-print-ipc", async (event, ...args) => {
  await runCommand(args[1]);
});

function createPrintFile(filename, content) {
  try { fs.writeFileSync(filename, content, 'utf-8'); }
  catch (e) {
    console.log('Failed to save the file !');
    console.log(e);
  }
}
