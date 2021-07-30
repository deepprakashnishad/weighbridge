import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MyDbService } from '../../my-db.service';
import { QueryList } from '../../query-list';

@Component({
  selector: 'app-list-editor',
  templateUrl: './list-editor.component.html',
  styleUrls: ['./list-editor.component.css']
})
export class ListEditorComponent implements OnInit {

  mControl = new FormControl();
  selectedItem: any = {};
  fieldId: number;
  fieldText: string="Enter value";
  title: string = "Edit List";
  hint: string = "";
  items: Array<any> = [];

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
    } else if (this.selectedItem.code.length != 3) {
      this.notifier.notify("error", "Code must be of exactly 3 characters");
      return;
    }
    if (this.selectedItem.id) {
      await this.dbService.executeSyncDBStmt("UPDATE", QueryList.UPDATE_SEARCH_FIELD_VALUE
        .replace("{id}", this.selectedItem.id)
        .replace("{mValue}", this.selectedItem.mValue)
        .replace("{code}", this.selectedItem.code)
      );
      this.selectedItem = {};
    } else {
      await this.dbService.executeInsertAutoId("search_field_value", "id", QueryList.INSERT_SEARCH_FIELD_VALUE
        .replace("{search_field_id}", this.fieldId.toString())
        .replace("{mValue}", this.selectedItem.mValue)
        .replace("{code}", this.selectedItem.code)
      );
      this.items.push(this.selectedItem);
      this.selectedItem = {};
    }
  }

  async removeItem(item, index) {
    var result = await this.dbService.executeSyncDBStmt("DELETE", QueryList.DELETE_SEARCH_FIELD_VALUE_BY_ID.replace("{id}", item.id.toString()))
    if (result) {
      this.items.splice(index, 1);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  editItem(item, index) {
    this.selectedItem = item;
  }
}
