import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MyDbService } from '../../my-db.service';
import { QueryList } from '../../query-list';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-list-editor',
  templateUrl: './list-editor.component.html',
  styleUrls: ['./list-editor.component.css']
})
export class ListEditorComponent implements OnInit {

  mControl = new FormControl();
  selectedItem: any = {};
  fieldId: number;
  fieldType: string;
  fieldText: string="Enter value";
  title: string = "Edit List";
  hint: string = "";
  codeLength: number = 3;
  items: Array<any> = [];
  filterStr = "";
  fileName = 'report.xlsx';
  filters: Array<any> = [];

  @Output() listModified: EventEmitter<Array<any>> = new EventEmitter();

  constructor(
    private dialogRef: MatDialogRef<ListEditorComponent>,
    private dbService: MyDbService,
    private notifier: NotifierService,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {

    if (data?.fieldId && data?.fieldId !== "undefined" && data?.fieldId !== null) {
      this.fieldId = data['fieldId'];
      this.fetchFieldValues();
    }

    if (data?.title) {
      this.title = data.title;
    }

    if (data.code) {
      this.selectedItem['code'] = data.code;
    }

    if (data.mValue) {
      this.selectedItem['mValue'] = data.mValue;
    }

    if (data.fieldType) {
      this.fieldType = data.fieldType;
      this.fileName = `${this.fieldType}.xlsx`;
    }
  }

  ngOnInit() {
  }

  async fetchFieldValues() {
    this.items = await this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_SEARCH_FIELD_VALUES_BY_SEARCH_FIELD_ID.replace("{search_field_id}", this.fieldId.toString()));
    console.log(this.items);
  }

  save() {
    this.dialogRef.close({ items: this.items });
  }

  async addItem() {
    if (this.selectedItem.mValue === undefined || this.selectedItem.code === undefined ||
      this.selectedItem.mValue.length === 0 || this.selectedItem.code.length === 0) {
      this.notifier.notify("error", "Code and value both are required");
      return;
    } else if (this.items.some(ele => {
      if (ele.id !== this.selectedItem.id && this.selectedItem.code === ele.code) {
        return true;
      }
    })) {
      this.notifier.notify("error", "Code must be unique");
      return;
    }
    if (this.selectedItem.id) {
      var result = await this.dbService.executeSyncDBStmt("UPDATE", QueryList.UPDATE_SEARCH_FIELD_VALUE
        .replace("{id}", this.selectedItem.id)
        .replace("{mValue}", this.selectedItem.mValue.toUpperCase())
        .replace("{code}", this.selectedItem.code.toUpperCase())
      );
    } else {
      var result = await this.dbService.executeInsertAutoId("search_field_value", "id", QueryList.INSERT_SEARCH_FIELD_VALUE
        .replace("{search_field_id}", this.fieldId.toString())
        .replace("{mValue}", this.selectedItem.mValue.toUpperCase())
        .replace("{code}", this.selectedItem.code.toUpperCase())
      );
      this.selectedItem.id = result['newId'];
      this.items.push(this.selectedItem);
    }
    this.selectedItem = {};
    this.notifier.notify("success", "Code list updated successfully");
  }

  async removeItem(item, index) {
    var result = await this.dbService.executeSyncDBStmt("DELETE", QueryList.DELETE_SEARCH_FIELD_VALUE_BY_ID.replace("{id}", item.id.toString()))
    if (result) {
      this.items.splice(index, 1);
      this.listModified.emit(this.items);
    }
  }

  cancel() {
    this.dialogRef.close({ items: this.items });
  }

  editItem(item, index) {
    this.selectedItem = item;
  }

  export() {
    /* table id is passed over here */
    let element = document.getElementById('reports-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }
}
