const { ipcMain } = require('electron');
const sql = require("mssql");
const process = require("process");

const mUsername = "admin";
const mPassword = "admin";
const mDatabase = "weighbridge";
const mServer = "localhost";

const sqlConfig = {
  user: mUsername,
  password: mPassword,
  database: mDatabase,
  server: mServer,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

//const pool = new sql.ConnectionPool(sqlConfig);
//const poolConnect = pool.connect();

//pool.on("error", err => {
//  console.log(err);
//});

ipcMain.on("executeDBQuery", (event, arg) => {
  sql.connect(sqlConfig).then(pool => {
    return pool.query(arg[1]);
  }).then(results => {
    event.sender.send("db-reply", [arg[0], results['recordset']]);
  });
})

ipcMain.handle("executeSyncStmt", async (event, arg) => {
  var pool = await sql.connect(sqlConfig);
  var results = await pool.query(arg[1]);
  console.log(results);
  return processResult(arg[0], results);
});

function processResult(queryType, result){
  if (queryType === "INSERT" || queryType === "UPDATE" || queryType === "DELETE") {
    return result['rowsAffected'][0] > 0;
  } else {
    return result['recordset'];
  }
}
