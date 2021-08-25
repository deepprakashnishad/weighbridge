import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { QueryList } from '../../query-list';
import { Weighment, WeighmentDetail } from '../../weighment/weighment';
import { TicketField } from '../ticket-setup/ticket';
import { TicketService } from '../ticket-setup/ticket.service';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  mFields: Array<TicketField> = [];
  htmlContent: string;

  constructor(
    private notifier: NotifierService,
    private dbService: MyDbService,
    private ticketService: TicketService,
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

  async getPreviewDataWithTemplate(weighment: Weighment, weighmentDetail: WeighmentDetail, fields?) {
    if (!fields) {
      var stmt = `SELECT * FROM ticket_template WHERE applicableTo LIKE '%${weighment.weighmentType}%' OR applicableTo='GENERIC'`;
      var templates = await this.dbService.executeSyncDBStmt("SELECT", stmt);
      fields = await this.fetchTemplateDetail(templates[0].id);
      fields = this.ticketService.getSortedFields(fields);
    }
    return {template: templates[0], ticketFields: fields, content: this.preparePreviewText(fields, weighment, weighmentDetail) };
  }

  async getPreviewText(weighment: Weighment, weighmentDetail: WeighmentDetail, fields?) {
    if (!fields) {
      var stmt = `SELECT * FROM ticket_template WHERE applicableTo LIKE '%${weighment.weighmentType}%' OR applicableTo='GENERIC'`;
      var templates = await this.dbService.executeSyncDBStmt("SELECT", stmt);
      fields = await this.fetchTemplateDetail(templates[0].id);
      fields = this.ticketService.getSortedFields(fields);
    }
    return this.preparePreviewText(fields, weighment, weighmentDetail);
  }

  private preparePreviewText(fields: Array<TicketField>,
    weighment: Weighment, weighmentDetail: WeighmentDetail) {
    var currX = 0, currY = 0;
    var mText = "";
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
    return mText;
    //this.ipcService.invokeIPC("printer-ipc", "print", mText);
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
        if (field.field.indexOf("weighmentDetails") === -1) {
          mText = `${mText} ${field.font} \"${field.displayName}: ${weighment[field.field]}\"`;
        } else if (field.field === "weighmentDetails") {
          var wFields = [];
          for (var wField of fields) {
            if (wField.type === "weighment_detail") {
              wFields.push(wField);
            }
          }
          mText = mText + this.prepareWeighmentTableText(weighment.weighmentDetails, wFields);
        }
      } else if (field.type === "freetext") {
        mText = `${mText} ${field.font} \"${field.displayName}\"`;
      }
    }
    return mText;
  }

  prepareWeighmentTableText(weighmentDetails: Array<WeighmentDetail>, fields: Array<TicketField>) {
    var mText = "";
    mText = mText + this.prepareWeighmentDetailsHeader(fields);
    var currY = 0;
    for (var i = 0; i < weighmentDetails.length; i++) {
      var wd = weighmentDetails[i];
      for (var field of fields) {
        if (currY < field.col) {
          mText = mText + " R \"" + " ".repeat(field.col - currY) + "\"";
          currY = field.col;
        }
        mText = `${mText} ${field.font} \"${wd[field.field] ? wd[field.field] : ""}`;
        currY = currY + (wd[field.field] ? wd[field.field].toString().length : 0);
      }
      mText = mText + " newline ";
      currY = 0;
    }

    return mText;
  }

  prepareWeighmentDetailsHeader(fields: Array<TicketField>) {
    var mText = "";

    var currY = 0;

    for (var i = 0; i < fields.length; i++) {
      if (currY <= fields[i].col) {
        mText = mText + " R \"" + " ".repeat(fields[i].col - currY) + "\"";
        mText = mText + " R \"" + fields[i].displayName + "\"";
        currY = fields[i].col + fields[i].displayName.length;
      } else {
        mText = mText + " R \"" + fields[i].displayName + "\"";
        currY = currY + fields[i].displayName.length;
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
      mText = `${mText}<tr>`;
      for (var field of fields) {
        //if (currY < field.col) {
        //  mText = mText + "&nbsp;".repeat(field.col - currY);
        //  currY = field.col;
        //}
        if (field.font === "RB") {
          mText = `${mText}<td style="text-align: center"><b>${wd[field.field] ? wd[field.field] : ""}</b></td>`;
        } else if (field.font === "DB") {
          mText = `${mText}<td style="text-align: center"><h3>${wd[field.field] ? wd[field.field] : ""}</h3></td>`;
        } else if (field.font === "D") {
          mText = `${mText}<td style="text-align: center"><h3>${wd[field.field] ? wd[field.field] : ""}</h3></td>`;
        } else {
          mText = `${mText}<td style="text-align: center">${wd[field.field] ? wd[field.field] : ""}</td>`;
        }
        currY = currY + (wd[field.field] ? wd[field.field].toString().length : 0);
      }
      mText = `${mText}</tr>`;
      //mText = mText + " <br/> ";
      currY = 0;
    }

    //return mText;
    return `<table>${mText}</table>`;
  }

  preparePreviewWeighmentDetailsHeader(fields: Array<TicketField>) {
    var mText = "";

    var currY = 0;

    for (var i = 0; i < fields.length; i++) {
      mText = mText + `<th><b>${fields[i].displayName.toUpperCase()}</b></th>`;
      //if (currY < fields[i].col) {
      //  mText = mText + "&nbsp;".repeat(fields[i].col - currY);
      //  mText = mText + `<b>${fields[i].displayName.toUpperCase()}</b>`;
      //  currY = fields[i].col + fields[i].displayName.length;
      //} else {
      //  mText = mText + `<b>${fields[i].displayName.toUpperCase()}</b>`;
      //  currY = currY + fields[i].displayName.length;
      //}
    }
    //mText = mText + " <br/> ";
    currY = 0;
    return `<tr>${mText}</tr>`
    //return mText;
  }
}
