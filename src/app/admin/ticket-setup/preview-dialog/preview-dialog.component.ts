import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { MyIpcService } from '../../../my-ipc.service';
import { TicketField } from '../ticket';

@Component({
  selector: 'app-preview-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.css']
})
export class PreviewDialogComponent implements OnInit {

  htmlContent: string;
  fields: Array<TicketField>;

  constructor(
    private notifier: NotifierService,
    private myIPCService: MyIpcService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    this.fields = data;
    
  }

  ngOnInit() {
    this.htmlContent = this.preparePreviewText(this.fields);
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
          mText = mText + "<b>" + field.displayName + ": " + `{${field.field}}` + "</b>";
        } else if (field.font === "DB") {
          mText = mText + "<h3>" + field.displayName + ": " + `{${field.field}}` + "</h3>";
        } else if (field.font === "D") {
          mText = mText + "<h3>" + field.displayName + ": " + `{${field.field}}` + "</h3>";
        } else {
          mText = mText + field.displayName + ": " + `{${field.field}}`;
        }

      } else {
        if (field.font === "RB" || field.font === "DB") {
          mText = mText + "<b>" + field.displayName + "</b>";
        } else {
          mText = mText + field.displayName;
        }
      }
    }
    return mText;
  }

  //print(fields: Array<TicketField>) {
  //  var cmd = "python print.py";
  //  cmd = cmd + " " + "RB" + " " + "\"Hare Krishna\"" + " " + "R"+" "+"\"Radhe Radhe\""+" newline R "+"\"Govind\"";
  //  this.myIPCService.invokeIPC("printer-ipc", "print", cmd);
  //}
  print(fields: Array<TicketField>) {
    var mText = "python print.py ";
    var currX = 0, currY = 0;
    let ESC = 0x001B;
    let E = 0x0045;
    let F = 0x0046;
    var bold = ESC + E;    // ESC, E
    var unbold = ESC + F;  // ESC, F

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.row > currX) {
        mText = mText + " newline ".repeat(field.row - currX);
        currX = field.row;
        currY = 0;
      }
      if (field.col > currY) {
        mText = mText + " R \"" +" ".repeat(field.col - currY)+"\"";
        currY = field.col;
      }
      if (field.type === "ticket-field") {
        mText = `${mText} ${field.font} \"${field.displayName}: ${field.field}\"`;

      } else {
        mText = `${mText} ${field.font} \"${field.displayName}\"`;
      }
    }
    console.log(mText);
    this.myIPCService.invokeIPC("printer-ipc", "print", mText);
    //this.myIPCService.invokeIPC("printer-ipc", "print", "notepad /P <filename>", mText);
  }
}
