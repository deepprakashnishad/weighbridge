import { Component, OnInit, 
  ViewChild, EventEmitter, 
  ElementRef, Inject, 
  Input, OnChanges, SimpleChange, Query } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent, } from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { map, startWith, switchMap, filter } from 'rxjs/operators';
import { Tag } from './tag';
import { MyDbService } from '../../my-db.service';
import { QueryList } from '../../query-list';



@Component({
selector: 'app-tag-chip-input',
templateUrl: './tag-chip-input.component.html',
styleUrls: ['./tag-chip-input.component.css']
})
export class TagChipInputComponent implements OnInit {

@Input()
public tags: Array<Tag>;
@Input()
public tagType: string;
@Input()
public isRemoveOnSeverFlag: boolean = false;
@Input()
public isSelection: boolean = false;

  @Input()
  selectedTags: Array<Tag>=[];
  filteredTags: Observable<Tag[]>;
  mControl=new FormControl();
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') auto: MatAutocomplete;
  
  constructor(
    private dbService: MyDbService
  ) { }

  ngOnInit() {
    this.filteredTags = this.mControl.valueChanges.pipe(
    startWith(''),
    map((filterStr: string) => {
      var list = this._filter(filterStr, this.tags)
      return list;
    }));
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for (let propName in changes) {
      let changedProp = changes[propName];
      if(!this.isSelection && propName.toLowerCase() === "facet" && changedProp.currentValue !== undefined){
        this.selectedTags = changedProp.currentValue['values'];
      }
    }
  }


  _filter(value:string, list: Array<any>): Array<any>{
    if(list && value && typeof value==="string"){
        const filterValue = value.toLowerCase();
        var list = list.filter(option => option.toLowerCase().includes(filterValue) 
          && this.selectedTags.indexOf(option)<0);  
        return list;
    } else if(list){
      return list.filter(option => this.tags.indexOf(option)<0);
    }
  } 

  selected(event: MatAutocompleteSelectedEvent){
    this.selectedTags.push(event.option.value);
    this.mControl.setValue(null);
    this.tagInput.nativeElement.value='';
  }

  remove(value: string): void {
    if (this.isRemoveOnSeverFlag) {
      
    }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our facet
    if (value.trim() !== "" && !this.auto.isOpen) {
      this.dbService.executeDBStmt("INSERT_TAG_DONT_SAVE",
        QueryList.INSERT_TAG.replace("{tagType}", this.tagType).replace("{value}", value)
      );
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  resetSelectedValues(){
    this.selectedTags = [];
  }
}
