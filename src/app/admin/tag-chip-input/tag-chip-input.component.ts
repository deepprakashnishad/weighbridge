import { Component, OnInit, 
  ViewChild, EventEmitter, 
  ElementRef, Inject, 
  Input, OnChanges, SimpleChange } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent, } from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { map, startWith, switchMap, filter } from 'rxjs/operators';
import { Tag } from './tag';



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
  selectedValues: Array<Tag>=[];
  filteredTags: Observable<Tag[]>;
  mControl=new FormControl();
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') auto: MatAutocomplete;
  
  constructor(
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
        this.selectedValues = changedProp.currentValue['values'];
      }
    }
}


  _filter(value:string, list: Array<any>): Array<any>{
    if(list && value && typeof value==="string"){
        const filterValue = value.toLowerCase();
        var list = list.filter(option => option.toLowerCase().includes(filterValue) 
          && this.selectedValues.indexOf(option)<0);  
        return list;
    } else if(list){
      return list.filter(option => this.tags.indexOf(option)<0);
    }
  } 

selected(event: MatAutocompleteSelectedEvent){
    this.selectedValues.push(event.option.value);
    this.mControl.setValue(null);
    this.tagInput.nativeElement.value='';
}

remove(value: string): void {
    const index = this.selectedValues.indexOf(value);

    if (index >= 0) {
      this.selectedValues.splice(index, 1);
    }

    if(this.isRemoveOnSeverFlag){
      this.facetService.updateFacet(this.facet)
        .subscribe((facet)=>{

        }, (err)=>alert("Failed to delete facet value"));	
    }
}

add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our facet
    if (value.trim() !== "" && !this.auto.isOpen) {
      this.selectedValues.push(value);
      this.facetService.updateFacet(this.facet)
      .subscribe((facet)=>{

      }, (err)=>alert("Could not create facet value"));
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  resetSelectedValues(){
    this.selectedValues = [];
  }
}
