import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { TicketField } from '../../admin/ticket-setup/ticket';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { QueryList } from '../../query-list';
import { Weighment } from '../weighment';

@Component({
  selector: 'app-weighment-summary',
  templateUrl: './weighment-summary.component.html',
  styleUrls: ['./weighment-summary.component.css']
})
export class WeighmentSummaryComponent implements OnInit {

  weighment: Weighment = new Weighment();
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
    }
  }

  ngOnInit() {
    this.fetchTemplates();
  }

  async fetchTemplates() {
    var stmt = `SELECT * FROM ticket_template WHERE applicableTo LIKE '%${this.weighment.weighmentType}%' OR applicableTo='GENERIC'`;
    var templates = await this.dbService.executeSyncDBStmt("SELECT", stmt);
    console.log(templates);
    if (templates.length > 0) {
      var templateDetail = await this.dbService.executeSyncDBStmt(
        "SELECT", QueryList.GET_TICKET_FIELDS.replace("{templateId}", templates[0].id.toString())
      );

      this.mFields = TicketField.fromJSON(templateDetail);
      this.preparePreviewText(this.mFields);
    } else {
      this.notifier.notify("error", "Matching ticket template not configured");
    }
    
  }

  preparePreviewText(fields: Array<TicketField>) {
    var mText = "";
    var currX = 0, currY = 0;

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
        if (field.font === "RB") {
          mText = mText + "<b>" + field.displayName + ": " + `{${this.weighment[field.field]
        }
      }` + "</b>";
        } else if (field.font === "DB") {
          mText = mText + "<h3>" + field.displayName + ": " + `{${this.weighment[field.field]}}` + "</h3>";
        } else if (field.font === "D") {
          mText = mText + "<h3>" + field.displayName + ": " + `{${this.weighment[field.field]}}` + "</h3>";
        } else {
          mText = mText + field.displayName + ": " + `{${this.weighment[field.field]}}`;
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
        mText = `${mText} ${field.font} \"${field.displayName}: ${this.weighment[field.field]}\"`;

      } else {
        mText = `${mText} ${field.font} \"${field.displayName}\"`;
      }
    }
    console.log(mText);
    this.myIPCService.invokeIPC("printer-ipc", "print", mText);
  }
}
