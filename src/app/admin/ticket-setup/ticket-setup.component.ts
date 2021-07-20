import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { QueryList } from '../../query-list';
import { CreateEditTicketTemplateComponent } from './create-edit-ticket-template/create-edit-ticket-template.component';
import { PreviewDialogComponent } from './preview-dialog/preview-dialog.component';
import { Ticket, TicketField } from './ticket';
import { TicketTemplate } from './ticket-template';

@Component({
  selector: 'app-ticket-setup',
  templateUrl: './ticket-setup.component.html',
  styleUrls: ['./ticket-setup.component.css']
})
export class TicketSetupComponent implements OnInit {

  templates: Array<TicketTemplate> = [];
  selectedTemplate: TicketTemplate = new TicketTemplate();

  ticketFields: Array<TicketField> = [];

  displayedColumns: Array<string> = ["displayString", "row", "col", "font", "action"];

  ticketFieldDataSource: MatTableDataSource<TicketField>;
  textFieldDataSource: MatTableDataSource<TicketField>;

  constructor(
    private notifier: NotifierService,
    private dbService: MyDbService,
    private dialog: MatDialog,
  ) {
    this.textFieldDataSource = new MatTableDataSource(TicketField.generateFreeTextRecords([]));
    this.ticketFieldDataSource = new MatTableDataSource(TicketField.generateTicketFields());
  }

  ngOnInit() {
    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_ALL_TICKET_TEMPLATE).then(results => {
      this.templates = results;
    });
  }

  openAddTicketTemplateDialog(){
    const dialogRef = this.dialog.open(CreateEditTicketTemplateComponent, {
      width: "600px",
      data: {title: "New ticket template"}
    });

    dialogRef.afterClosed().subscribe((result)=>{
      console.log(result);
    });
  }

  openEditTicketTemplateDialog(){
    const dialogRef = this.dialog.open(CreateEditTicketTemplateComponent, {
      data: {
        title: "New ticket template",
        ticketTemplate: this.selectedTemplate
      }
    });

    dialogRef.afterClosed().subscribe((result)=>{
      console.log(result);
    });
  }

  async saveTemplateDetail() {
    if (!this.selectedTemplate) {
      this.notifier.notify("error", "Please select a template");
      return;
    }
    for (var i = 0; i < this.ticketFieldDataSource.data.length; i++) {
      this.ticketFieldDataSource.data[i]['id'] = await this.insertTicketField(this.ticketFieldDataSource.data[i], this.selectedTemplate.id);
    }
    for (var i = 0; i < this.textFieldDataSource.data.length; i++) {
      this.textFieldDataSource.data[i]['id'] = await this.insertTicketField(this.textFieldDataSource.data[i], this.selectedTemplate.id);
    }
    this.notifier.notify("success", "Template details saved successfully");
  }



  async insertTicketField(data: TicketField, templateId) {
    if (data.id === undefined && data.displayName?.length > 0) {
      var stmt = QueryList.INSERT_TICKET_FIELD
        .replace("{templateId}", templateId.toString())
        .replace("{field}", data.field ? data.field: null)
        .replace("{type}", data.type ? data.type: null)
        .replace("{diplayName}", data.displayName ? data.displayName: null)
        .replace("{row}", data.row ? data.row.toString() :"null")
        .replace("{col}", data.col ? data.col.toString() : "null")
        .replace("{isIncluded}", data.isIncluded ? "1" : "0")
        .replace("{font}", data.font ? data.font : "R");

      var insertionResult = await this.dbService.executeInsertAutoId("template_detail", "id", stmt);
      return insertionResult['newId'];
    } else if (data.id) {
      var stmt = QueryList.UPDATE_TICKET_FIELD
        .replace("{id}", data.id.toString())
        .replace("{templateId}", templateId.toString())
        .replace("{field}", data.field ? data.field : null)
        .replace("{type}", data.type ? data.type : null)
        .replace("{displayName}", data.displayName ? data.displayName : null)
        .replace("{row}", data.row ? data.row.toString() : "null")
        .replace("{col}", data.col ? data.col.toString() : "null")
        .replace("{isIncluded}", data.isIncluded ? "1" : "0")
        .replace("{font}", data.font ? data.font : "R");
      this.dbService.executeSyncDBStmt("UPDATE", stmt).then(res => {
      });
    } else if (data.id && data.displayName.length === 0) {
      //Delete entry from database
      //var stmt = QueryList.DELETE_TICKET_FIELD.replace("{id}", data.id.toString());
      //this.dbService.executeSyncDBStmt("DELETE", stmt).then(res => {
      //  console.log(res);
      //});
    }
  }

  previewTemplate() {
    var ticketFields = this.getCurrentFieldData();
    if (ticketFields.length === 0) {
      this.notifier.notify("error", "Please select fields to preview");
      return;
    }
    //var mText = this.preparePreviewText(ticketFields);
    //console.log(mText);

    this.dialog.open(PreviewDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      data: ticketFields
    });

  }

  getCurrentFieldData() {
    var ticketFields = [];
    for (var i = 0; i < this.ticketFieldDataSource.data.length; i++) {
      var temp = this.ticketFieldDataSource.data[i];
      if (temp.col !== null && temp.row !== null && temp.isIncluded) {
        ticketFields.push(temp);
      }
    }
    for (var i = 0; i < this.textFieldDataSource.data.length; i++) {
      var temp = this.textFieldDataSource.data[i];
      if (temp.displayName?.length>0 && temp.col !== null && temp.row !== null && temp.isIncluded) {
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

  async selectedTemplateChanged() {
    var result = await this.dbService.executeSyncDBStmt(
      "SELECT", QueryList.GET_TICKET_FIELDS.replace("{templateId}", this.selectedTemplate.id.toString())
    );

    var mFields = TicketField.fromJSON(result);
    var ticketFields = mFields["ticketFields"];
    var freetextFields = mFields["freetextFields"];

    if (ticketFields.length > 0) {
      this.ticketFieldDataSource.data = ticketFields;
    } else {
      this.ticketFieldDataSource.data = TicketField.generateTicketFields();
    }
    this.textFieldDataSource.data = TicketField.generateFreeTextRecords(freetextFields);
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
          mText = mText + "<b>"+field.displayName + ": " + `{${field.field}}` + "</b>";
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

  print(fields: Array<TicketField>) {
    var mText = "";
    var currX = 0, currY = 0;

    var bold = [ 0x001B, 0x0045];    // ESC, E
    var unbold = [ 0x001B, 0x0046];    // ESC, F

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.row > currX) {
        mText = mText + "\n".repeat(field.row - currX);
        currX = field.row;
        currY = 0;
      }
      if (field.col > currY) {
        mText = mText + " ".repeat(field.col - currY);
        currY = field.col;
      }
      if (field.type === "ticket-field") {
        if (field.font === "RB") {
          mText = mText + new String(bold) + field.displayName + ": " + `{${field.field}}` + new String(unbold);
        } else if (field.font === "DB") {
          mText = mText + new String(bold) + field.displayName + ": " + `{${field.field}}` + new String(unbold);
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
}
