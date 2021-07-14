const { ipcMain } = require("electron");

function getPrinters() {
  var printers = win.webContents.getPrinters();
  return printers;
}

ipcMain.handle("printer-ipc", async (event, ...args) => {
  if (args[0] === "getPrinters") {
    return getPrinters();
  }
})
