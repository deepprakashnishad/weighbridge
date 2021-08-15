import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { TicketField } from '../../admin/ticket-setup/ticket';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { QueryList } from '../../query-list';
import { Weighment, WeighmentDetail } from '../weighment';

const colPos = [1, 5, 15, 25, 45, 55, 75];

@Component({
  selector: 'app-weighment-summary',
  templateUrl: './weighment-summary.component.html',
  styleUrls: ['./weighment-summary.component.css']
})
export class WeighmentSummaryComponent implements OnInit {

  weighment: Weighment = new Weighment();
  weighmentDetail: WeighmentDetail = new WeighmentDetail();
  mFields: Array<TicketField> = [];
  htmlContent: string;

  constructor(
    public dialogRef: MatDialogRef<WeighmentSummaryComponent>,
    private notifier: NotifierService,
    private myIPCService: MyIpcService,
    private dbService: MyDbService,
    @Inject(MAT_DIALOG_DATA) data: any
  ) { 
    if(data){
      this.weighment = data.weighment;
      if (data['weighmentDetail']) {
        this.weighmentDetail = data['weighmentDetail'];
      }
    }
  }

  ngOnInit() {
    this.fetchTemplates();
  }

  async fetchTemplates() {
    var stmt = `SELECT * FROM ticket_template WHERE applicableTo LIKE '%${this.weighment.weighmentType}%' OR applicableTo='GENERIC'`;
    var templates = await this.dbService.executeSyncDBStmt("SELECT", stmt);
    if (templates.length > 0) {
      var templateDetail = await this.dbService.executeSyncDBStmt(
        "SELECT", QueryList.GET_TICKET_FIELDS.replace("{templateId}", templates[0].id.toString())
      );

      this.mFields = TicketField.fromJSON(templateDetail, false) as Array<TicketField>;
      this.preparePreviewText(this.mFields);
    } else {
      this.notifier.notify("error", "Matching ticket template not configured");
    }
  }

  preparePreviewText(fields: Array<TicketField>) {
    var mText = "";
    var currX = 0, currY = 0;

    fields = this.getCurrentFieldData(fields);

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
            mText = mText + "<b>" + field.displayName + ": " + `${this.weighment[field.field]}` + "</b>";
          } else if (field.font === "DB") {
            mText = mText + "<h3>" + field.displayName + ": " + `${this.weighment[field.field]}` + "</h3>";
          } else if (field.font === "D") {
            mText = mText + "<h3>" + field.displayName + ": " + `${this.weighment[field.field]}` + "</h3>";
          } else {
            if (field.field.indexOf("weighDetails") > -1) {
              mText = mText + field.displayName + ": " + `${this.weighmentDetail[field.field.substr("weighDetails_".length)]}`;
            } else {
              mText = mText + field.displayName + ": " + `${this.weighment[field.field]}`;
            }
            
          }
        } else if (field.field === "weighmentDetails") {
          mText = mText + this.preparePreviewWeighmentTableText(this.weighment.weighmentDetails)
        }
      } else {
        if (field.font === "RB" || field.font === "DB") {
          mText = mText + "<b>" + field.displayName + "</b>";
        } else {
          mText = mText + field.displayName;
        }
      }
    }
    
    this.htmlContent = mText;
    return mText;
  }

  print(fields: Array<TicketField>) {
    var mText = "python print.py ";
    var currX = 0, currY = 0;

    fields = this.getCurrentFieldData(fields);

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
          mText = `${mText} ${field.font} \"${field.displayName}: ${this.weighmentDetail[field.field.substr("weighDetails_".length)]}\"`;
        } else if (this.weighment[field.field] && field.field.indexOf("weighmentDetails") === -1) {
          mText = `${mText} ${field.font} \"${field.displayName}: ${this.weighment[field.field]}\"`;
        }
      } else {
        mText = `${mText} ${field.font} \"${field.displayName}\"`;
      }
    }
    mText = mText + this.prepareWeighmentTableText(this.weighment.weighmentDetails);

    console.log(mText);
    this.myIPCService.invokeIPC("printer-ipc", "print", mText);
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

      if (weighmentDetails[0].secondWeight !== undefined && weighmentDetails[0].secondWeight!=null) {
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
        mText = mText + " R \"" + field[i] +"\"";
        currY = currY + field[i].length;
      }
    }
    mText = mText + " newline ";
    currY = 0;

    return mText;
  }

  preparePreviewWeighmentTableText(weighmentDetails: Array<WeighmentDetail>) {

    var mText = "";
    mText = mText + this.preparePreviewWeighmentDetailsHeader();
    var currY = 0;

    for (var i = 0; i < weighmentDetails.length; i++) {
      var field = weighmentDetails[i];

      if (currY <= colPos[0]) {
        mText = mText + "&nbsp;".repeat(colPos[0] - currY);
        mText = mText + (i + 1).toString();
        currY = colPos[0] + (i + 1).toString().length;
      } else {
        mText = mText + (i + 1).toString();
        currY = currY + (i + 1).toString().length;
      }

      if (currY <= colPos[1]) {
        mText = mText + "&nbsp;".repeat(colPos[1] - currY);
        mText = mText + weighmentDetails[i].material;
        currY = colPos[1] + weighmentDetails[i].material.length;
      } else {
        mText = mText + "&nbsp;" + weighmentDetails[i].material;
        mText = mText + weighmentDetails[i].material;
        currY = currY + weighmentDetails[i].material.length;
      }

      if (currY <= colPos[2]) {
        mText = mText + "&nbsp;".repeat(colPos[2] - currY);
        mText = mText + weighmentDetails[i].firstWeight;
        currY = colPos[2] + weighmentDetails[i].firstWeight.toString().length;
      } else {
        mText = mText + " " + weighmentDetails[0].firstWeight;
        mText = mText + weighmentDetails[i].firstWeight;
        currY = currY + weighmentDetails[i].firstWeight.toString().length;
      }

      if (currY <= colPos[3]) {
        mText = mText + "&nbsp;".repeat(colPos[3] - currY);
        mText = mText + weighmentDetails[i].firstWeightDatetime;
        currY = colPos[3] + weighmentDetails[i].firstWeightDatetime.toString().length;
      } else {
        mText = mText + "&nbsp;" + weighmentDetails[i].firstWeightDatetime;
        mText = mText + weighmentDetails[i].firstWeightDatetime;
        currY = currY + weighmentDetails[i].firstWeightDatetime.toString().length;
      }

      if (weighmentDetails[i].secondWeight !== undefined && weighmentDetails[i].secondWeight != null) {
        if (currY <= colPos[4]) {
          mText = mText + "&nbsp;".repeat(colPos[4] - currY);
          mText = mText + weighmentDetails[i].secondWeight;
          currY = colPos[4] + weighmentDetails[i].secondWeight.toString().length;
        } else {
          mText = mText + "&nbsp;" + weighmentDetails[i].secondWeight;
          mText = mText + weighmentDetails[i].secondWeight;
          currY = currY + weighmentDetails[i].secondWeight.toString().length;
        }

        if (currY <= colPos[5]) {
          mText = mText + "&nbsp;".repeat(colPos[5] - currY);
          mText = mText + weighmentDetails[i]?.secondWeightDatetime;
          currY = colPos[5] + weighmentDetails[i]?.secondWeightDatetime?.toString()?.length;
        } else {
          mText = mText + "&nbsp;" + weighmentDetails[0].secondWeightDatetime;
          mText = mText + weighmentDetails[i]?.secondWeightDatetime;
          currY = currY + weighmentDetails[i]?.secondWeightDatetime?.toString()?.length;
        }

        if (currY <= colPos[6]) {
          mText = mText + "&nbsp;".repeat(colPos[6] - currY);
          mText = mText + weighmentDetails[i]?.netWeight;
          currY = colPos[6] + weighmentDetails[i].netWeight?.toString().length;
        } else {
          mText = mText + "&nbsp;" + weighmentDetails[0].netWeight;
          mText = mText + weighmentDetails[i]?.netWeight;
          currY = currY + weighmentDetails[i]?.netWeight?.toString().length;
        }
      }

      mText = mText + " <br/> ";
      currY = 0;
    }

    return mText;
  }

  preparePreviewWeighmentDetailsHeader() {
    var mText = "";

    var currY = 0;

    var field = ["#", "Material", "Wt1", "Wt1 Datetime", "Wt2", "Wt2 Datetime", "Net Wt"];

    for (var i = 0; i < field.length; i++) {
      if (currY <= colPos[i]) {
        mText = mText + "&nbsp;".repeat(colPos[i] - currY);
        mText = mText + field[i];
        currY = colPos[i] + field[i].length;
      } else {
        mText = mText + field[i];
        currY = currY + field[i].length;
      }
    }
    mText = mText + " <br/> ";
    currY = 0;

    return mText;
  }

  getCurrentFieldData(fields: Array<TicketField>) {
    var ticketFields = [];
    for (var i = 0; i < fields.length; i++) {
      var temp = fields[i];
      if (temp.col !== null && temp.row !== null && temp.isIncluded) {
        ticketFields.push(temp);
      }
    }
    ticketFields = ticketFields.sort(function (a, b) {
      if ((a['row'] - b['row']) === 0) {
        return a['col'] - b['col'];
      }
      return a['row'] - b['row'];
    })

    return ticketFields;
  }
}
