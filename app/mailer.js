const dbService = require("./db-service.js");
const { ipcMain } = require('electron');

var nodemailer = require('nodemailer');
const log = require('electron-log');

log.transports.file.level = 'info';
log.transports.file.file = __dirname + 'port-reader.log';


ipcMain.handle("send-email", async (event, args) => {
  try {
    var content = args[0];
    var subject = args[1];
    var recipients = args[2];

    var appData = await dbService.stmtExecutor("SELECT", "SELECT * FROM app_data");
    var mData = {};
    appData.forEach(ele => {
      mData[ele['field']] = ele['mValue'];
    });
    console.log(mData);
    var transportConfig = {
      host: mData['email_server'],
      port: mData['email_port'],
      service: mData['email_provider'],
      auth: {
        user: mData['sender_email_id'],
        pass: mData['email_password']
      }
    };
    var transporter = nodemailer.createTransport(transportConfig);

    var mailOptions = {
      from: appData['sender_email_id'],
      to: recipients,
      subject: subject,
      text: content,
      testMode: false,
      ssl: true
    };

    console.log(transportConfig);

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        log.error(error);
      } else {
        log.info('Email sent: ' + info.response);
      }
    });
  } catch (ex) {
    log.error(ex);
  }
})
