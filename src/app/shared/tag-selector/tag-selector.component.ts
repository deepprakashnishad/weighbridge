import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MyDbService } from '../../my-db.service';
import { QueryList } from '../../query-list';

@Component({
  selector: 'app-tag-selector',
  templateUrl: './tag-selector.component.html',
  styleUrls: ['./tag-selector.component.css']
})
export class TagSelectorComponent implements OnInit, OnChanges {

  mControl = new FormControl();
  @Input() selectedTag: any;
  @Input() tagTypeId: number;
  @Input() title: string;
  @Input() hint: string = "";
	@Output() optionSelected = new EventEmitter<any>();

	@ViewChild(MatAutocompleteTrigger) trigger;

  filteredOptions: Observable<any[]>;

  options: Array<any> = [];

  limit: number=30;
  offset: number=0;
  searchStr: string = "";

  constructor(
    private dbService: MyDbService
  ) { }

  ngOnInit() {
    this.filteredOptions = this.mControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filter(name) : this.options.slice())
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => (option?.mValue.toLowerCase().includes(filterValue) ||
      option?.code.toLowerCase().includes(filterValue)));
  }

  ngOnChanges(changes: SimpleChanges) {
    var keys = Object.keys(changes);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] === "selectedTag" && changes[keys[i]]["currentValue"]) {
        this.mControl.setValue(changes[keys[i]]["currentValue"]);
      }
      if (keys[i] === "tagTypeId" && changes[keys[i]]["currentValue"]) {
        this.fetchData();
      }
    }
  }

  async fetchData() {
    this.options = await this.dbService.executeSyncDBStmt("SELECT",
      QueryList.GET_SEARCH_FIELD_VALUES_BY_SEARCH_FIELD_ID.replace(
        "{search_field_id}", this.tagTypeId.toString()
      )
    );
    console.log(this.options);
  }

  onFocus(){
    this.trigger._onChange(""); 
    this.trigger.openPanel();
  }

  selected($event){
    if($event.option.value.role===null){
      $event.option.value.role = {id:undefined, name: "", description:""}
    }
    this.selectedTag = $event.option.value;
  	this.optionSelected.emit($event.option.value);
  }

  displayFn(item: any): string | undefined{
    if (item && item.code && item.mValue) {
      return `${item?.code} - ${item?.mValue}`;
    } else {
      return undefined;
    }
    
  }

}
