var soap = require('strong-soap').soap;
const { app, ipcMain } = require('electron');
const db = require('./db-service.js');
const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.file.file = __dirname + 'sap.log';

const username = 'bflpidev';
const password = 'pi1234';
const sapEndpoint = "http://bfpdv1.kalyanicorp.com:50000/dir/wsdl?p=ic/c50e2242ef723dee8dfebc7dbcedb0f6";

var options = {
  wsdl_headers: {
    'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64'),
  }
};

ipcMain.handle("sendDataToSAP", async (event, args) => {
  try {
    //dummyDriver(args[0]);
    log.info(args[0]);
    sendToSAP(args[0]);
  } catch (err) {
    log.error(err);
    return { error: err.message };
  }
});

//function dummyDriver(data) {
//  for (var i = 0; i < data.length; i++) {
//    data[i].SYNC_FLAG = 1;
//    updateSyncFlag(data[i]);
//  }
//}

function sendToSAP(data) {
  //Data in Request Body
  if (data.length) {
    
    //wsdl service
    var url = sapEndpoint;
    
    //wsdl service data input format
    var RequestData = {
      MT_WEIGHBRIDGE_WEIGHT_DATA_REQ: {
        WEIGHBRIDGE_TAB: {
          WEIGHBRIDGE_DATA: data
        }
      }
    }
    //Create SOAP client
    log.info("Sending data to SAP");
    log.info(RequestData);
    //log.info("SAP Endpoint - " + url);
    //log.info(username+":"+password);
    soap.createClient(url, options, function (err, client) {
      if (err) {
        log.error(err);
        return err
      }

      //Set Authorisation
      client.setSecurity(new soap.BasicAuthSecurity(username, password));

      //wsdl Service call 
      client.SI_WEIGHBRIDGE_WEIGHT_DATAService.HTTP_Port.SI_WEIGHBRIDGE_WEIGHT_DATA(RequestData, function (err, response, envelope) {
        if (err) {
          log.error(err);
          return err;
        } else {
          log.info("Respose from SAP");
          log.info(response);
          if (response['WEIGHBRIDGE_TAB']['WEIGHBRIDGE_DATA']) {
            var itemsResponse = [];
            itemsResponse = response['WEIGHBRIDGE_TAB']['WEIGHBRIDGE_DATA'];
            itemsResponse.forEach(element => {
              if (element.SYNC_FLAG == 1) {
                updateSyncFlag(element);
              }
            });
          }
        }
      });
    });
  }
}

function updateSyncFlag(data){
  var stmt = `UPDATE weighment SET syncFlag=1 WHERE rstNo=${data['WEIGHMENT_RST_NO']}`;
  db.stmtExecutor("UPDATE", stmt);
}
