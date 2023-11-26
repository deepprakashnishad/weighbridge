import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { QueryList } from '../../query-list';
import { HtmlViewerComponent } from '../../shared/html-viewer/html-viewer.component';
import { Weighment } from '../../weighment/weighment';
import { PrinterService } from '../printer-setup/printer.service';
import { CreateEditTicketTemplateComponent } from './create-edit-ticket-template/create-edit-ticket-template.component';
import { PreviewDialogComponent } from './preview-dialog/preview-dialog.component';
import { TicketField } from './ticket';
import { TicketTemplate } from './ticket-template';

@Component({
  selector: 'app-ticket-setup',
  templateUrl: './ticket-setup.component.html',
  styleUrls: ['./ticket-setup.component.css']
})
export class TicketSetupComponent implements OnInit {

  templates: Array<TicketTemplate> = [];
  selectedTemplate: TicketTemplate = new TicketTemplate();
  copyFrom: TicketTemplate;
  isCopying: boolean = false;

  ticketFields: Array<TicketField> = [];

  displayedColumns: Array<string> = ["displayString", "row", "col", "font", "action"];

  ticketFieldDataSource: MatTableDataSource<TicketField>;
  textFieldDataSource: MatTableDataSource<TicketField>;
  columnFieldDataSource: MatTableDataSource<TicketField>;
  imageFieldDataSource: MatTableDataSource<TicketField>;

  newlineField: TicketField = TicketField.generateNewlineTicketField();
  reverseFeedField: TicketField = TicketField.generateReverseFeedTicketField();


  constructor(
    private notifier: NotifierService,
    private dbService: MyDbService,
    private dialog: MatDialog,
    private printerService: PrinterService
  ) {
    this.textFieldDataSource = new MatTableDataSource(TicketField.generateFreeTextRecords([]));
    this.columnFieldDataSource = new MatTableDataSource(TicketField.generateColumnFieldRecords());
    this.ticketFieldDataSource = new MatTableDataSource(TicketField.generateTicketFields());
    this.imageFieldDataSource = new MatTableDataSource(TicketField.generateImageFields());
  }

  ngOnInit() {
    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_ALL_TICKET_TEMPLATE).then(results => {
      this.templates = results;
    });
  }

  openAddTicketTemplateDialog(){
    const dialogRef = this.dialog.open(CreateEditTicketTemplateComponent, {
      width: "600px",
      data: {title: "New ticket template", existingTemplates: this.templates}
    });

    dialogRef.afterClosed().subscribe((result)=>{
      console.log(result);
      if(result){
        if(result.copyFrom){
          this.copyFrom = result.copyFrom;
          this.selectedTemplateChanged(true);
          this.selectedTemplate = result.template;
        }
        this.templates.push(result.template);
      }
    });
  }

  openEditTicketTemplateDialog(){
    const dialogRef = this.dialog.open(CreateEditTicketTemplateComponent, {
      width: "600px",
      data: {
        title: "Edit ticket template",
        ticketTemplate: this.selectedTemplate,
        existingTemplates: this.templates
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        var index = -1;
        for (var i = 0; i < this.templates.length; i++) {
          if(this.templates[i].id === result.template.id){
            index=i;
            break;
          }
        }
        if(result.copyFrom){
          this.copyFrom = result.copyFrom;
          this.selectedTemplateChanged(true);
          this.selectedTemplate = this.templates[index];
        }

      }      
    });
  }

  async deleteTemplate(){
    if(!this.selectedTemplate){
      this.notifier.notify("error", "Please select a template");
      return;
    }

    if(this.selectedTemplate.id === 1){
      this.notifier.notify("error", "This template cannot be deleted");
      this.notifier.notify("error", "To avoid usage of this template mark select weightment type as DUMMY");
      return;
    }

    var mRes = await this.dbService.executeSyncDBStmt("DELETE", QueryList.DELETE_TICKET_FIELDS_BY_TEMPLATE_ID.replace("{templateId}", this.selectedTemplate.id.toString()));
    
    await this.dbService.executeSyncDBStmt("DELETE", QueryList.DELETE_TICKET_TEMPLATE.replace("{id}", this.selectedTemplate.id.toString()));
    var index = this.templates.findIndex(ele=>ele.id===this.selectedTemplate.id);
    this.templates.splice(index);
    console.log(this.templates);
    this.selectedTemplate = new TicketTemplate();
    this.notifier.notify("success", "Template deleted successfully");
  }

  async saveTemplateDetail() {
    if (!this.selectedTemplate) {
      this.notifier.notify("error", "Please select a template");
      return;
    }

    if(this.isCopying){
      var mRes = await this.dbService.executeSyncDBStmt("DELETE", QueryList.DELETE_TICKET_FIELDS_BY_TEMPLATE_ID.replace("{templateId}", this.selectedTemplate.id.toString()));
      console.log(mRes);
    }
    //console.log(this.ticketFieldDataSource.data);
    for (var i = 0; i < this.ticketFieldDataSource.data.length; i++) {
      this.ticketFieldDataSource.data[i]['id'] = await this.insertTicketField(this.ticketFieldDataSource.data[i], this.selectedTemplate.id);
    }
    for (var i = 0; i < this.textFieldDataSource.data.length; i++) {
      this.textFieldDataSource.data[i]['id'] = await this.insertTicketField(this.textFieldDataSource.data[i], this.selectedTemplate.id);
    }
    for (var i = 0; i < this.columnFieldDataSource.data.length; i++) {
      this.columnFieldDataSource.data[i]['id'] = await this.insertTicketField(this.columnFieldDataSource.data[i], this.selectedTemplate.id);
    }

    for (var i = 0; i < this.imageFieldDataSource.data.length; i++) {
      this.imageFieldDataSource.data[i]['id'] = await this.insertTicketField(this.imageFieldDataSource.data[i], this.selectedTemplate.id);
    }

    this.newlineField['id'] = await this.insertTicketField(this.newlineField, this.selectedTemplate.id);
    this.reverseFeedField['id'] = await this.insertTicketField(this.reverseFeedField, this.selectedTemplate.id);
    this.notifier.notify("success", "Template details saved successfully");
  }

  async insertTicketField(data: TicketField, templateId) {
    if (data.id === undefined && data.displayName?.length > 0) {
      var stmt = QueryList.INSERT_TICKET_FIELD
        .replace("{templateId}", templateId.toString())
        .replace("{field}", data.field ? data.field: null)
        .replace("{type}", data.type ? data.type: null)
        .replace("{displayName}", data.displayName ? data.displayName: null)
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
      return data.id;
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
    var weighment = Weighment.randomGenerator("inbound", 3, "pending");
    this.printerService.getPreviewText(
      weighment,
      weighment.weighmentDetails[weighment.weighmentDetails.length - 1],
      ticketFields
    ).then(result => {
      console.log(result);
      this.dialog.open(PreviewDialogComponent, {
        data: {
          htmlContent: result,
          fontSize: 12,
          fields: ticketFields,
          ticketTemplate: this.selectedTemplate,
          'weighment': weighment,
          'weighmentDetail': weighment.weighmentDetails[weighment.weighmentDetails.length - 1]
        }
      });
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

    for (var i = 0; i < this.imageFieldDataSource.data.length; i++) {
      var temp = this.imageFieldDataSource.data[i];
      if (temp.displayName?.length > 0 && temp.col !== null && temp.row !== null && temp.isIncluded) {
        ticketFields.push(temp);
      }
    }
    if (this.includeWeighmentTableField()) {
      for (var i = 0; i < this.columnFieldDataSource.data.length; i++) {
        var temp = this.columnFieldDataSource.data[i];
        if (temp.displayName?.length > 0 && temp.col !== null && temp.isIncluded) {
          ticketFields.push(temp);
        }
      }
    }

    ticketFields.push(this.newlineField);
    ticketFields.push(this.reverseFeedField);
    ticketFields = ticketFields.sort(function (a, b) {
      if ((a['row'] - b['row']) === 0) {
        return a['col'] - b['col'];
      }
      return a['row'] - b['row'];
    })

    return ticketFields;
  }

  async selectedTemplateChanged(isCopying: boolean = false) {
    var result;
    if(isCopying){
      result = await this.dbService.executeSyncDBStmt(
        "SELECT", QueryList.GET_TICKET_FIELDS.replace("{templateId}", this.copyFrom.id.toString())
      );
      result = result.map(ele=>{
        ele.templateId=this.selectedTemplate.id; 
        delete ele.id;
        return ele;
      });
      console.log(result);
    }else{
      result = await this.dbService.executeSyncDBStmt(
        "SELECT", QueryList.GET_TICKET_FIELDS.replace("{templateId}", this.selectedTemplate.id.toString())
      );
      this.copyFrom = undefined
    } 
    this.isCopying = isCopying;
    var mFields = TicketField.fromJSON(result, true);

    var ticketFields = mFields["ticketFields"];
    var freetextFields = mFields["freetextFields"];
    var weighDetailFields = mFields["weighDetailFields"];
    var imageFields = mFields['imageFields'];

    this.ticketFieldDataSource.data = TicketField.generateTicketFields(ticketFields);

    this.columnFieldDataSource.data = TicketField.generateColumnFieldRecords(weighDetailFields);

    this.imageFieldDataSource.data = TicketField.generateImageFields(imageFields);

    if (mFields['newlineField']) {
      this.newlineField = mFields['newlineField'];
    }

    if (mFields['reverseFeedField']) {
      this.reverseFeedField = mFields['reverseFeedField'];
    }

    this.textFieldDataSource.data = TicketField.generateFreeTextRecords(freetextFields);
  }

  includeWeighmentTableField() {
    for (var i in this.ticketFieldDataSource.data) {
      if (this.ticketFieldDataSource.data[i]['field'] === "weighmentDetails") {
        return this.ticketFieldDataSource.data[i]['isIncluded'];
      }
    }
    return false;
  }
}
