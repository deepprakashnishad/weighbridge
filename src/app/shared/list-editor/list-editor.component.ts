import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-list-editor',
  templateUrl: './list-editor.component.html',
  styleUrls: ['./list-editor.component.css']
})
export class ListEditorComponent implements OnInit {

  mControl = new FormControl();
  selectedText: string;
  items: Array<string> = [];
  fieldText: string="Enter value";
  title: string = "Edit List";
  hint: string = "";

  constructor(
    private dialogRef: MatDialogRef<ListEditorComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    if (data?.items && data?.items !== "undefined" && data?.items !== null) {
      this.items = data['items'];
    }

    if (data?.title) {
      this.title = data.title;
    }
  }

  ngOnInit() {
    
  }

  save() {
    this.dialogRef.close({ items: this.items });
  }

  addItem() {
    this.items.push(this.selectedText);
    this.selectedText = "";
  }

  removeItem(index) {
    this.items.splice(index, 1);
  }

  cancel() {
    this.dialogRef.close();
  }
}
