const dbService = require("./db-service.js");
const { ipcMain, app, BrowserWindow } = require('electron');
const fs = require('fs');
const bootstrapData = require("./bootstrap.js");

var nodemailer = require('nodemailer');

//const log = require('electron-log');
//log.transports.file.level = 'info';
//log.transports.file.file = __dirname + 'port-reader.log';

const DAILY_REPORT_JOB = "daily-weighment-report";

var transporter;
var appData;
var mData = {};

initializeTransporter();

var recipients;

ipcMain.handle("schedule-job", async (event, args) => {
  try {
    if (args[0] === "daily-weighment-report") {
      scheduleJob(DAILY_REPORT_JOB, getCronTimeString(args[1]));
    }
  } catch (ex) {
    log.error(ex);
  }
});

ipcMain.handle("cancel-job", async (event, args) => {
  try {
    cancelJob(args[0]);
  } catch (ex) {
    log.error(ex);
  }
});

function scheduleJob(jobName, jobtime) {
  const schedule = require('node-schedule');
  const job = schedule.scheduleJob(jobName, jobtime, () => {
    win.webContents.send("send-daily-weighment-report", []);
  });
}

function cancelJob(jobName) {
  try {
    var my_job = schedule.scheduledJobs[jobName];
    my_job.cancel();
  } catch (e) {
    console.log(e);
  }
  
}

ipcMain.handle("send-email", async (event, args) => {
  try {
    var content = args[0];
    var subject = args[1];
    var recipients = args[2];

    if (!transporter) {
      await initializeTransporter();
    }

    mailSender(mData['sender_email_id'], recipients, subject, content)
  } catch (ex) {
    log.error(ex);
  }
});

ipcMain.handle("send-html-attachment-email", async (event, args) => {
  try {

    var path = app.getPath('userData') + "\\" + bootstrapData.mConstants.appName + "\\daily-reports";
    var filename = args[0]['filename'];

    fs.mkdir(path, { recursive: true }, function (err) {
      if (err) return cb(err);
      try {
        fs.writeFileSync(path + "\\temp.html", args[0]['reportContent'], 'utf-8');
      } catch (e) {
        console.log(e);
      }
      
      window_to_PDF = new BrowserWindow({ show: false });
      window_to_PDF.loadURL(path + "\\temp.html");

      window_to_PDF.webContents.on("did-finish-load", function () {
        window_to_PDF.webContents.printToPDF(pdfSettings()).then(async function (data) {
          try {           
            fs.writeFileSync(`${path}\\${filename}`, data);
            if (!transporter) {
              await initializeTransporter();
            }
            var mRecipients = (JSON.parse(mData.recipients)).map(ele => ele.email);
            var mRecipientsStr = mRecipients.join(";");

            mailSender(
              mData['sender_email_id'],
              mRecipients,
              args[0]['subject'],
              args[0]['text'],
              [{
                filename: filename,
                path: `${path}\\${filename}`,
                contentType: 'application/pdf'
              }]
            )
          } catch (err) {
            console.log(err);
          }
        });
      });
    });
  } catch (ex) {
    log.error(ex);
  }
});

ipcMain.handle("send-email-with-attachment", async (event, args) => {
  try {
    if (!transporter) {
      await initializeTransporter();
    }
    var mRecipients = (JSON.parse(mData.recipients)).map(ele => ele.email);

    mailSender(
      mData['sender_email_id'],
      mRecipients,
      args[0]['subject'],
      args[0]['text'],
      args[0]['attachments']
    )
  } catch (ex){
    console.log(ex);
  }
});

function pdfSettings() {
  var paperSizeArray = ["A4", "A5"];
  var option = {
    landscape: false,
    marginsType: 0,
    printBackground: false,
    printSelectionOnly: false,
  };
  return option;
}


function mailSender(from, recipients, subject, text = "", attachments = [], html =undefined, testMode = false, ssl = true) {
  try {
    var mailOptions = {
      "from": from,
      "to": recipients,
      "subject": subject,
      "testMode": false,
      "ssl": true,
      "attachments": attachments
    };

    if (html) {
      mailOptions['html'] = html;
    } else {
      mailOptions['text'] = text;
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        log.error(error);
      } else {
        log.debug('Email sent: ' + info.response);
      }
    });
    console.log("Mail sent successfully");
  } catch (ex) {
    log.error(ex);
  }
}

async function initializeTransporter() {
  appData = await dbService.stmtExecutor("SELECT", "SELECT * FROM app_data");
  appData.forEach(ele => {
    mData[ele['field']] = ele['mValue'];
  });
  try {
    var transportConfig = {
      host: mData['email_server'],
      port: mData['email_port'],
      service: mData['email_provider'],
      auth: {
        user: mData['sender_email_id'],
        pass: mData['email_password']
      }
    };
    transporter = nodemailer.createTransport(transportConfig);

    initializeEmailSchedular(mData);
  } catch (e) {
    console.log(e);
  }
}

function initializeEmailSchedular(mData) {
  if (mData['enable_daily_operator_collection_email']==="true") {
    var time = mData['collection_email_time'];
    scheduleJob(DAILY_REPORT_JOB, getCronTimeString(time));
  }
}

function getCronTimeString(time) {
  var temp = time.split(" ");
  var time = temp[0].split(":");
  if (temp[1]==="PM") {
    time[0] = parseInt(time[0]) + 12;
  }

  var cronTime = `0 ${time[1]} ${time[0]} * * *`;
  return cronTime;
}
