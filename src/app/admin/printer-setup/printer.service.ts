import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { QueryList } from '../../query-list';
import { Weighment, WeighmentDetail } from '../../weighment/weighment';
import { TicketField } from '../ticket-setup/ticket';

const colPos = [0, 5, 15, 25, 45, 55, 75];

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  mFields: Array<TicketField> = [];
  htmlContent: string;

  constructor(
    private notifier: NotifierService,
    private dbService: MyDbService,
    private ipcService: MyIpcService
  ) {}

  private async fetchTemplateDetail(templateId) {
    if (templateId) {
      var templateDetail = await this.dbService.executeSyncDBStmt(
        "SELECT", QueryList.GET_TICKET_FIELDS.replace("{templateId}", templateId)
      );

      return TicketField.fromJSON(templateDetail, false) as Array<TicketField>;
    } else {
      this.notifier.notify("error", "Ticket template is missing");
    }
  }

  async previewText(weighment: Weighment, weighmentDetail: WeighmentDetail, template?) {
    if (!template) {
      var stmt = `SELECT * FROM ticket_template WHERE applicableTo LIKE '%${weighment.weighmentType}%' OR applicableTo='GENERIC'`;
      var templates = await this.dbService.executeSyncDBStmt("SELECT", stmt);
      template = await this.fetchTemplateDetail(templates[0].id);
    }
    return this.preparePreviewText(template, weighment, weighmentDetail);
  }

  private preparePreviewText(fields: Array<TicketField>,
    weighment: Weighment, weighmentDetail: WeighmentDetail) {
    var mText = "";
    var currX = 0, currY = 0;

    //fields = this.getCurrentFieldData(fields);

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.row > currX) {
        mText = mText + "<br/>".repeat(field.row - currX);
        currX = field.row;
        currY = 0;
      }
      if (field.col > currY) {
        mText = mText + "&nbsp;".repeat(field.col - currY);
        currY = field.col;
      }
      if (field.type === "ticket-field") {
        if (field.field.indexOf("weighmentDetails") === -1) {
          if (field.font === "RB") {
            mText = mText + "<b>" + field.displayName + ": " + `${weighment[field.field]}` + "</b>";
          } else if (field.font === "DB") {
            mText = mText + "<h3>" + field.displayName + ": " + `${weighment[field.field]}` + "</h3>";
          } else if (field.font === "D") {
            mText = mText + "<h3>" + field.displayName + ": " + `${weighment[field.field]}` + "</h3>";
          } else {
            if (field.field.indexOf("weighDetails") > -1) {
              mText = mText + field.displayName + ": " + `${weighmentDetail[field.field.substr("weighDetails_".length)]}`;
            } else {
              mText = mText + field.displayName + ": " + `${weighment[field.field]}`;
            }
          }
        } else if (field.field === "weighmentDetails") {
          var wFields = [];
          for (var wField of fields) {
            if (wField.type === "weighment_detail") {
              wFields.push(wField);
            }
          }
          mText = mText + this.preparePreviewWeighmentTableText(weighment.weighmentDetails, wFields);
        }
      } else if(field.type === "freetext"){
        if (field.font === "RB" || field.font === "DB") {
          mText = mText + "<b>" + field.displayName + "</b>";
        } else {
          mText = mText + field.displayName;
        }
      }
    }

    //this.htmlContent = mText;
    return mText;
  }

  async rawTextPrint(weighment: Weighment, weighmentDetail: WeighmentDetail, template) {
    if (!template) {
      var stmt = `SELECT * FROM ticket_template WHERE applicableTo LIKE '%${weighment.weighmentType}%' OR applicableTo='GENERIC'`;
      var templates = await this.dbService.executeSyncDBStmt("SELECT", stmt);
      template = this.fetchTemplateDetail(templates[0].id);
    }
    var mText = this.getPythonRawPrintText(template, weighment, weighmentDetail);
    this.ipcService.invokeIPC("printer-ipc", "print", mText);
  }

  private getPythonRawPrintText(fields: Array<TicketField>, weighment: Weighment, weighmentDetail: WeighmentDetail) {
    var mText = "python print.py ";
    var currX = 0, currY = 0;

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.row > currX) {
        mText = mText + " newline ".repeat(field.row - currX);
        currX = field.row;
        currY = 0;
      }
      if (field.col > currY) {
        mText = mText + " R \"" + " ".repeat(field.col - currY) + "\"";
        currY = field.col;
      }
      if (field.type === "ticket-field") {
        if (field.field.indexOf("weighDetails") > -1) {
          mText = `${mText} ${field.font} \"${field.displayName}: ${weighmentDetail[field.field.substr("weighDetails_".length)]}\"`;
        } else if (weighment[field.field] && field.field.indexOf("weighmentDetails") === -1) {
          mText = `${mText} ${field.font} \"${field.displayName}: ${weighment[field.field]}\"`;
        }
      } else {
        mText = `${mText} ${field.font} \"${field.displayName}\"`;
      }
    }
    mText = mText + this.prepareWeighmentTableText(weighment.weighmentDetails);

    return mText;
  }

  prepareWeighmentTableText(weighmentDetails: Array<WeighmentDetail>) {

    var mText = "";
    mText = mText + this.prepareWeighmentDetailsHeader();
    var currY = 0;

    for (var i = 0; i < weighmentDetails.length; i++) {
      var field = weighmentDetails[i];

      if (currY <= colPos[0]) {
        mText = mText + " R \"" + " ".repeat(colPos[0] - currY) + "\"";
        mText = mText + " R \"" + (i + 1).toString() + "\"";
        currY = colPos[0] + (i + 1).toString().length;
      } else {
        mText = mText + " R \"" + (i + 1).toString() + "\"";
        currY = currY + (i + 1).toString().length;
      }

      if (currY <= colPos[1]) {
        mText = mText + " R \"" + " ".repeat(colPos[1] - currY) + "\"";
        mText = mText + " R \"" + weighmentDetails[0].material + "\"";
        currY = colPos[1] + weighmentDetails[0].material.length;
      } else {
        mText = mText + " " + weighmentDetails[0].material;
        mText = mText + " R \"" + weighmentDetails[0].material + "\"";
        currY = currY + weighmentDetails[0].material.length;
      }

      if (currY <= colPos[2]) {
        mText = mText + " R \"" + " ".repeat(colPos[2] - currY) + "\"";
        mText = mText + " R \"" + weighmentDetails[0].firstWeight + "\"";
        currY = colPos[2] + weighmentDetails[0].firstWeight.toString().length;
      } else {
        mText = mText + " " + weighmentDetails[0].firstWeight;
        mText = mText + " R \"" + weighmentDetails[0].firstWeight + "\"";
        currY = currY + weighmentDetails[0].firstWeight.toString().length;
      }

      if (currY <= colPos[3]) {
        mText = mText + " R \"" + " ".repeat(colPos[3] - currY) + "\"";
        mText = mText + " R \"" + weighmentDetails[0].firstWeightDatetime + "\"";
        currY = colPos[3] + weighmentDetails[0].firstWeightDatetime.toString().length;
      } else {
        mText = mText + " " + weighmentDetails[0].firstWeightDatetime;
        mText = mText + " R \"" + weighmentDetails[0].firstWeightDatetime + "\"";
        currY = currY + weighmentDetails[0].firstWeightDatetime.toString().length;
      }

      if (weighmentDetails[0].secondWeight !== undefined && weighmentDetails[0].secondWeight != null) {
        if (currY <= colPos[4]) {
          mText = mText + " R \"" + " ".repeat(colPos[4] - currY) + "\"";
          mText = mText + " R \"" + weighmentDetails[0].secondWeight + "\"";
          currY = colPos[4] + weighmentDetails[0].secondWeight.toString().length;
        } else {
          mText = mText + " " + weighmentDetails[0].secondWeight;
          mText = mText + " R \"" + weighmentDetails[0].secondWeight + "\"";
          currY = currY + weighmentDetails[0].secondWeight.toString().length;
        }

        if (currY <= colPos[5]) {
          mText = mText + " R \"" + " ".repeat(colPos[5] - currY) + "\"";
          mText = mText + " R \"" + weighmentDetails[0]?.secondWeightDatetime + "\"";
          currY = colPos[5] + weighmentDetails[0]?.secondWeightDatetime?.toString()?.length;
        } else {
          mText = mText + " " + weighmentDetails[0].secondWeightDatetime;
          mText = mText + " R \"" + weighmentDetails[0]?.secondWeightDatetime + "\"";
          currY = currY + weighmentDetails[0]?.secondWeightDatetime?.toString()?.length;
        }

        if (currY <= colPos[6]) {
          mText = mText + " R \"" + " ".repeat(colPos[6] - currY) + "\"";
          mText = mText + " R \"" + weighmentDetails[0]?.netWeight + "\"";
          currY = colPos[6] + weighmentDetails[0].netWeight?.toString().length;
        } else {
          mText = mText + " " + weighmentDetails[0].netWeight;
          mText = mText + " R \"" + weighmentDetails[0]?.netWeight + "\"";
          currY = currY + weighmentDetails[0]?.netWeight?.toString().length;
        }
      }

      mText = mText + " newline ";
      currY = 0;
    }

    return mText;
  }

  prepareWeighmentDetailsHeader() {
    var mText = "";

    var currY = 0;

    var field = ["#", "Material", "Wt1", "Wt1 Datetime", "Wt2", "Wt2 Datetime", "Net Wt"];

    for (var i = 0; i < field.length; i++) {
      if (currY <= colPos[i]) {
        mText = mText + " R \"" + " ".repeat(colPos[i] - currY) + "\"";
        mText = mText + " R \"" + field[i] + "\"";
        currY = colPos[i] + field[i].length;
      } else {
        mText = mText + " R \"" + field[i] + "\"";
        currY = currY + field[i].length;
      }
    }
    mText = mText + " newline ";
    currY = 0;

    return mText;
  }

  preparePreviewWeighmentTableText(weighmentDetails: Array<WeighmentDetail>, fields: Array<TicketField>) {

    var mText = "";
    mText = mText + this.preparePreviewWeighmentDetailsHeader(fields);
    var currY = 0;

    for (var i = 0; i < weighmentDetails.length; i++) {
      var wd = weighmentDetails[i];

      for (var field of fields) {
        if (currY < field.col) {
          mText = mText + "&nbsp;".repeat(field.col - currY);
        }
        mText = mText + (wd[field.field] ? wd[field.field] : "");
        currY = colPos[0] + (wd[field.field] ? wd[field.field].toString().length : 0);
      }

      mText = mText + " <br/> ";
      currY = 0;
    }

    return mText;
  }

  preparePreviewWeighmentDetailsHeader(fields: Array<TicketField>) {
    var mText = "";

    var currY = 0;

    for (var i = 0; i < fields.length; i++) {
      if (currY < fields[i].col) {
        mText = mText + "&nbsp;".repeat(fields[i].col - currY);
        mText = mText + fields[i].displayName;
        currY = colPos[i] + fields[i].displayName.length;
      } else {
        mText = mText + fields[i].displayName;
        currY = currY + fields[i].displayName.length;
      }
    }
    mText = mText + " <br/> ";
    currY = 0;

    return mText;
  }

  //getCurrentFieldData(fields: Array<TicketField>) {
  //  var ticketFields = [];
  //  for (var i = 0; i < fields.length; i++) {
  //    var temp = fields[i];
  //    if (temp.col !== null && temp.row !== null && temp.isIncluded) {
  //      ticketFields.push(temp);
  //    }
  //  }
  //  ticketFields = ticketFields.sort(function (a, b) {
  //    if ((a['row'] - b['row']) === 0) {
  //      return a['col'] - b['col'];
  //    }
  //    return a['row'] - b['row'];
  //  })

  //  return ticketFields;
  //}
}
