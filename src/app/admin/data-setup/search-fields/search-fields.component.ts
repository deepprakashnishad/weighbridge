import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, SimpleChange } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, startWith, switchMap, filter } from 'rxjs/operators';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';

import { TagChipInputComponent } from './../../tag-chip-input/tag-chip-input.component';

import { Tag } from './../../tag-chip-input/tag';
import { MyDbService } from '../../../my-db.service';
import { QueryList } from '../../../query-list';
import { SearchField } from './search-field';
import { NotifierService } from 'angular-notifier';
import { MatDialog } from '@angular/material/dialog';
import { ListEditorComponent } from '../../../shared/list-editor/list-editor.component';

@Component({
  selector: 'app-search-fields',
  templateUrl: './search-fields.component.html',
  styleUrls: ['./search-fields.component.css']
})
export class SearchFieldsComponent implements OnInit {

  searchFields: Array<SearchField> = [];
  searchField: SearchField = new SearchField();

  constructor(
    private dialog: MatDialog,
    private notifier: NotifierService,
    private dbService: MyDbService
  ) { }

  ngOnInit() {
    this.dbService.executeSyncDBStmt("get_search_fields", QueryList.GET_ALL_SEARCH_FIELD).then(results => {
      this.searchFields = results;
    });
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName === "tagJson" && changedProp.currentValue) {
        
      }
    }
  }

  populateTagValuesMap() {
    
  }

  delete(field: SearchField, index) {
    console.log(field);
    if (field.id === null || field.id === undefined) {
      this.notifier.notify("error", "Id cannot be null");
      return;
    }
    this.dbService.executeSyncDBStmt(
      "DELETE",
      QueryList.DELETE_SEARCH_FIELD
        .replace("{id}", field.id.toString())
    ).then(isOperated => {
      this.searchFields.splice(index, 1);
      this.notifier.notify("success", "Search Field deleted successfully");
    });
  }

  _filter(value: string, list: Array<any>): Array<any> {
    if (value && typeof value === "string") {
      const filterValue = value.toLowerCase();
      return list.filter(option => (option.title.toLowerCase()
        .includes(filterValue)));
    } else if (list) {
      return list;
    }
  }

  displayFn(tag?: Tag): string | undefined {
    return tag ? tag.value : undefined;
  }

  selected($event) {
    
  }

  save() {
    if (this.searchField.id) {
      this.dbService.executeSyncDBStmt(
        "UPDATE",
        QueryList.UPDATE_SEARCH_FIELD
          .replace("{displayName}", this.searchField.displayName)
          .replace("{entryMode}", this.searchField.entryMode)
          .replace("{inOutMode}", this.searchField.inOutMode)
          .replace("{id}", this.searchField.id.toString())
      ).then(isOperated => {
        if (isOperated) {
          this.notifier.notify("success", "Search field updated successfully");
          for (var i = 0; i < this.searchFields.length; i++) {
            if (this.searchField.id === this.searchFields[i].id) {
              this.searchFields[i] = this.searchField;
              break;
            }
          }
          this.searchField = new SearchField();
        }
      });
    } else {
      this.dbService.executeInsertAutoId(
        "search_field",
        "id",
        QueryList.INSERT_SEARCH_FIELD
          .replace("{displayName}", this.searchField.displayName)
          .replace("{entryMode}", this.searchField.entryMode)
          .replace("{inOutMode}", this.searchField.inOutMode)
      ).then(result => {
        if (result['newId']) {
          this.searchField.id = result['newId'];
          this.searchFields.push(this.searchField);
          this.notifier.notify("success", "Search field created successfully");
          this.searchField = new SearchField();
        }        
      });
    }
  }

  edit(field) {
    this.searchField = field;
  }

  openListEditor(field: SearchField, index) {
    var dialogRef = this.dialog.open(ListEditorComponent, {
      height: "600px",
      width: "800px",
      data: {
        title: `Edit ${field.displayName} values`,
        fieldId: field.id,
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.notifier.notify("success", "Search field updated successfully");
      }
    });
  }
}

