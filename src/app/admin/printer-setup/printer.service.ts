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

      var fields = TicketField.fromJSON(templateDetail, true) as Array<TicketField>;
      return this.getCurrentFieldData(
        fields['ticketFields'],
        fields['freetextFields'],
        fields['weighDetailFields'],
        fields['newlineField']
      );
    } else {
      this.notifier.notify("error", "Ticket template is missing");
    }
  }

  getCurrentFieldData(ticketFields, freetextFields, weighDetailFields, newlineField) {
    var fields = [];
    for (var i = 0; i < ticketFields.length; i++) {
      var temp = ticketFields[i];
      if (temp.col !== null && temp.row !== null && temp.isIncluded) {
        fields.push(temp);
      }
    }
    for (var i = 0; i < freetextFields.length; i++) {
      var temp = freetextFields[i];
      if (temp.displayName?.length > 0 && temp.col !== null && temp.row !== null && temp.isIncluded) {
        fields.push(temp);
      }
    }
    if (this.includeWeighmentTableField(ticketFields)) {
      for (var i = 0; i < weighDetailFields.length; i++) {
        var temp = weighDetailFields[i];
        if (temp.displayName?.length > 0 && temp.col !== null && temp.isIncluded) {
          fields.push(temp);
        }
      }
    }

    fields.push(newlineField);

    fields = fields.sort(function (a, b) {
      if ((a['row'] - b['row']) === 0) {
        return a['col'] - b['col'];
      }
      return a['row'] - b['row'];
    })

    return fields;
  }

  includeWeighmentTableField(ticketFields) {
    for (var field of ticketFields) {
      if (field['field'] ==="weighmentDetails") {
        return field['isIncluded'];
      }
    }
    return false;
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
    weighment: Weighment, origWeighmentDetail: WeighmentDetail) {
    var weighmentDetail = this.updateWeighmentDetail(
      origWeighmentDetail, weighment.weighmentDetails
    );
    var separator = ": ";
    var currX = 0, currY = 0;
    var mText = "<div style='font-family: monospace, monospace;'>";
    var minLabelLength = this.getLargestLabelLength(fields);
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var data = "";
      if (field.type === "newline") {
        mText = mText + "<br/>".repeat(field.col);
        return mText;
      }
      if (field.row > currX) {
        mText = mText + "<br/>".repeat(field.row - currX);
        currX = field.row;
        currY = 0;
      }
      if (field.col > currY) {
        mText = mText + "&nbsp;".repeat(field.col - currY);
        currY = field.col;
      }
      if (field.type === "ticket-field" && (weighment[field.field] || weighmentDetail[field.field.substr("weighDetails_".length)])) {
        if (field.field !== "weighmentDetails") {
          //mText = mText + "<table>";
          //for (var j = i; j < fields.length;) {
          //  mText = mText + "<tr>";
          //  for (var k = j + 1; k < fields.length;) {
          //    if (fields[k].row === fields[j].row) {
          //      mText = mText + `<td>${fields[j].displayName}</td><td>${this.getData(weighment, weighmentDetail, fields[j])} </td>`;
          //      k++; j++; i++;
          //    } else {
          //      mText = mText + `<td>${fields[j].displayName}</td><td>${this.getData(weighment, weighmentDetail, fields[j])} </td>`;
          //      k++; j++; i++;
          //      mText = mText + "</tr>";
          //      break;
          //    }
          //  }
          //  if (fields[j + 1].type !== "ticket-field" || fields[j + 1].field === "weighmentDetails") {
          //    break;
          //  }
          //}
          //mText = mText + "</table>";
          data = field.displayName + "&nbsp;".repeat(minLabelLength - field.displayName?.length) + separator;
          var valLength = 0;
          if (field.field.indexOf("weighDetails") > -1) {
            data = data + `${weighmentDetail[field.field.substr("weighDetails_".length)]}`;
            valLength = weighmentDetail[field.field.substr("weighDetails_".length)].toString().length;
          } else {
            data = data + `${weighment[field.field]}`;
            valLength = weighment[field.field].length;
          }
          if (field.font === "RB") {
            mText = mText + "<b>" + data + "</b>";
          } else if (field.font === "DB") {
            mText = mText + "<h3>" + data + "</h3>";
          } else if (field.font === "D") {
            mText = mText + "<h3>" + data + "</h3>";
          } else {
            currY = currY + separator.length + minLabelLength + valLength;
            mText = mText + data;
          }
        } else if (field.field === "weighmentDetails") {
          var wFields = [];
          for (var wField of fields) {
            if (wField.type === "weighment_detail") {
              wFields.push(wField);
            }
          }
          mText = mText + this.preparePreviewWeighmentTableText(weighment.weighmentDetails, wFields, field.col);
        }
      } else if (field.type === "freetext") {
        if (field.font === "RB" || field.font === "DB") {
          mText = mText + "<b>" + field.displayName + "</b>";
        } else {
          mText = mText + field.displayName;
        }
      }
    }

    mText = mText + "</div>";
    return mText;
  }

  getData(weighment, weighmentDetail, field) {
    var data = "";
    if (field.field.indexOf("weighDetails") > -1) {
      data = data + `${weighmentDetail[field.field.substr("weighDetails_".length)]? weighmentDetail[field.field.substr("weighDetails_".length)]:""}`;
    } else {
      data = data + `${weighment[field.field] ? weighment[field.field]:""}`;
    }

    return data?data:"";
  }

  async rawTextPrint(weighment: Weighment, weighmentDetail: WeighmentDetail, template?) {
    if (!template || template.length===0) {
      var stmt = `SELECT * FROM ticket_template WHERE applicableTo LIKE '%${weighment.weighmentType}%' OR applicableTo='GENERIC'`;
      var templates = await this.dbService.executeSyncDBStmt("SELECT", stmt);
      template = await this.fetchTemplateDetail(templates[0].id);
    }
    var mText = this.getPythonRawPrintText(template, weighment, weighmentDetail);
    return mText;
    //this.ipcService.invokeIPC("printer-ipc", "print", mText);
  }

  private getPythonRawPrintText(fields: Array<TicketField>, weighment: Weighment, origWeighmentDetail: WeighmentDetail) {
    var weighmentDetail: WeighmentDetail = this.updateWeighmentDetail(origWeighmentDetail, weighment.weighmentDetails);
    var mText = "python print.py ";
    var currX = 0, currY = 0;

    var minLabelSize = this.getLargestLabelLength(fields);

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.type === "newline") {
        mText = mText + " newline ".repeat(field.col);
        return mText;
      }

      if (field.row > currX) {
        mText = mText + " newline ".repeat(field.row - currX);
        currX = field.row;
        currY = 0;
      }
      if (field.col > currY && field.field !== "weighmentDetails") {
        mText = mText + " R \"" + " ".repeat(field.col - currY) + "\"";
        currY = field.col;
      }

      if (field.type === "ticket-field") {
        if (field.field.indexOf("weighmentDetails") === -1) {
          var data = "";
          if (field.field.indexOf("weighDetails") > -1) {
            data = ` ${field.font} \"${field.displayName}${" ".repeat(minLabelSize - field.displayName?.length)}: ${weighmentDetail[field.field.substr("weighDetails_".length)] ? weighmentDetail[field.field.substr("weighDetails_".length)]:""}\"`;
          } else {
            if (weighment[field.field]) {
              data = ` ${field.font} \"${field.displayName}${" ".repeat(minLabelSize - field.displayName.length)}: ${weighment[field.field]}\"`;
            }
          }
          mText = `${mText}${data}`;
          currY = currY + data.length;
        } else if (field.field === "weighmentDetails") {
          var wFields = [];
          for (var wField of fields) {
            if (wField.type === "weighment_detail") {
              wFields.push(wField);
            }
          }
          mText = mText + this.prepareWeighmentTableText(weighment.weighmentDetails, wFields, field.col);
        }
      } else if (field.type === "freetext") {
        mText = `${mText} ${field.font} \"${field.displayName}\"`;
      }
    }
    return mText;
  }

  //Gets the largest label length for proper adjustment of ticket fields
  getLargestLabelLength(fields: Array<TicketField>) {
    var maxLength = 0;

    for (var field of fields) {
      if (field.type === "ticket-field" && field.field.indexOf("weighmentDetails")) {
        maxLength = field.displayName?.length > maxLength ? field.displayName.length : maxLength;
      }      
    }
    console.log("Maxlength - " + maxLength);
    return maxLength;
  }

  // Gets min length required by each column
  getMinLengthMap(weighmentDetails: Array<WeighmentDetail>, fields: Array<TicketField>) {
    var defaultAddedLength = 5;
    var minLengthMap = {};
    for (var field of fields) {
      minLengthMap[field.field] = field.displayName.length;
    }

    for (var i in weighmentDetails) {
      var data = weighmentDetails[i];
      for (var field of fields) {
        if (field.field === "sNo") {
          minLengthMap[field.field] = (i + 1).toString()?.length > minLengthMap[field.field] ?
            (i + 1).toString()?.length : minLengthMap[field.field];
        } else {
          minLengthMap[field.field] = data[field.field]?.length > minLengthMap[field.field] ?
            data[field.field]?.length : minLengthMap[field.field];
        }        
      }
    }

    for (var key of Object.keys(minLengthMap)) {
      minLengthMap[key] = minLengthMap[key] + defaultAddedLength;
    }
    return minLengthMap;
  }

  prepareWeighmentTableText(weighmentDetails: Array<WeighmentDetail>, fields: Array<TicketField>, padding: number) {
    var mText = "";
    var minLengthMap = this.getMinLengthMap(weighmentDetails, fields);
    mText = mText + this.prepareWeighmentDetailsHeader(fields, minLengthMap, padding);
    //var currY = 0;
    for (var i = 0; i < weighmentDetails.length; i++) {
      var mText = `${mText} R \"${" ".repeat(padding)}\"`;
      var wd = weighmentDetails[i];
      for (var field of fields) {
        if (field.field==="sNo") {
          var temp = i+1;
        } else {
          temp = wd[field.field] ? wd[field.field] : "";
        }
        
        mText = `${mText} ${field.font} \"${temp}`;
        if (minLengthMap[field.field] > temp.toString().length) {
          mText = mText + " ".repeat(minLengthMap[field.field] - temp.toString().length) + "\"";
        }
        //if (currY < field.col) {
        //  mText = mText + " R \"" + " ".repeat(field.col - currY) + "\"";
        //  currY = field.col;
        //}
        //mText = `${mText} ${field.font} \"${wd[field.field] ? wd[field.field] : ""}`;
        //currY = currY + (wd[field.field] ? wd[field.field].toString().length : 0);
      }
      mText = mText + " newline ";
      //currY = 0;
    }

    return mText;
  }

  prepareWeighmentDetailsHeader(fields: Array<TicketField>, minLengthMap: any, padding: number) {
    var mText = ` R \"${" ".repeat(padding)}`;
    var currY = 0;
    for (var i = 0; i < fields.length; i++) {
      mText = mText + fields[i].displayName;
      if (fields[i].displayName.length < minLengthMap[fields[i].field]) {
        mText = mText + " ".repeat(minLengthMap[fields[i].field] - fields[i].displayName.length);
      }
    }
    mText = mText + "\" newline ";
    currY = 0;

    //var mText = " ".repeat(padding);
    //var currY = 0;
    //for (var i = 0; i < fields.length; i++) {
    //  mText = mText + " R \"" + fields[i].displayName;
    //  if (fields[i].displayName.length < minLengthMap[fields[i].field]) {
    //    mText = mText + " ".repeat(minLengthMap[fields[i].field] - fields[i].displayName.length) + "\"";
    //  } else {
    //    mText = mText + "\"";
    //  }
    //}
    //mText = mText + " newline ";
    //currY = 0;

    return mText;
  }

  preparePreviewWeighmentTableText(weighmentDetails: Array<WeighmentDetail>, fields: Array<TicketField>, padding: number=0) {

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
        var data = wd[field.field];
        if (field.field === "sNo") {
          data = i + 1;
        }
        if (field.font === "RB") {
          mText = `${mText}<td style="text-align: center"><b>${data ? data : ""}</b></td>`;
        } else if (field.font === "DB") {
          mText = `${mText}<td style="text-align: center"><h3>${data ? data : ""}</h3></td>`;
        } else if (field.font === "D") {
          mText = `${mText}<td style="text-align: center"><h3>${data ? data : ""}</h3></td>`;
        } else {
          mText = `${mText}<td style="text-align: center">${data ? data : ""}</td>`;
        }
        currY = currY + (data ? data.toString().length : 0);
      }
      mText = `${mText}</tr>`;
      //mText = mText + " <br/> ";
      currY = 0;
    }

    return `<table style="margin-left:${padding}ch">${mText}</table>`;
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

  getTotalNetWeight(weighmentDetails: Array<WeighmentDetail>) {
    var firstWeight = weighmentDetails[0].firstWeight;
    var secondWeight, netWeight;
    if (weighmentDetails[weighmentDetails.length - 1].secondWeight) {
      secondWeight = weighmentDetails[weighmentDetails.length - 1].secondWeight;
    } else if (weighmentDetails.length>1 && weighmentDetails[weighmentDetails.length - 2].secondWeight) {
      secondWeight = weighmentDetails[weighmentDetails.length - 2].secondWeight;
    }

    if (secondWeight) {
      netWeight = Math.abs(firstWeight - secondWeight);
    }

    return { "wt1": firstWeight, "wt2": secondWeight, "netWeight": netWeight };
  }

  updateWeighmentDetail(weighmentDetail: WeighmentDetail, weighmentDetails: Array<WeighmentDetail>) {
    var clone = Object.assign({}, weighmentDetail);
    var result = this.getTotalNetWeight(weighmentDetails);
    clone.firstWeight = result['wt1'];
    clone.secondWeight = result['wt2'];
    clone.netWeight = result['netWeight'];

    return clone;
  }
}
