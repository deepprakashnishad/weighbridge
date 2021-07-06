import { 
  Component, 
  OnInit, 
  Output, 
  Input,
  ViewChild, 
  EventEmitter,
  SimpleChange 
} from '@angular/core';
import {FormControl} from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import {PersonService} from './../person.service';
import {Person} from './../person';
import { PersonAddEditComponent } from '../person-add-edit/person-add-edit.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { NotifierService } from 'angular-notifier';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-person-search',
  templateUrl: './person-search.component.html',
  styleUrls: ['./person-search.component.scss']
})
export class PersonSearchComponent implements OnInit {

	personControl = new FormControl();
  @Input() selectedPerson: Person;

  @Input("displayMode") displayMode = "dropdown"; //dropdown or grid

	@Output() personSelected = new EventEmitter<Person>();

	@ViewChild(MatAutocompleteTrigger) trigger;

  filteredPersons: Array<Person>;

  limit: number=30;
  offset: number=0;
  searchStr: string = "";

  constructor(
  	private personService: PersonService,
    private notifier: NotifierService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  	this.personControl.valueChanges.subscribe(val => {
      if(typeof val === "string" && val.length > 3){
        this.searchStr = val;
        this.offset = 0;
        this.fetchPersonList();
      }
  	});

    this.fetchPersonList();
  }

  fetchPersonList(){
    this.personService.fetchFilteredPersonList(this.searchStr, this.limit, this.offset)
    .subscribe((personList)=>{
      if(this.offset===0){
        this.filteredPersons = personList;
      }else{
        this.filteredPersons.concat(personList);
      }
    });
  }

  onFocus(){
    this.trigger._onChange(""); 
    this.trigger.openPanel();
  }

  selected($event){
    if($event.option.value.role===null){
      $event.option.value.role = {id:undefined, name: "", description:""}
    }
    this.selectedPerson = $event.option.value;
  	this.personSelected.emit($event.option.value);
  }

  selectedInGrid(person){
    this.selectedPerson = person;
  	this.personSelected.emit(person);
  }

  displayFn(item: any): string | undefined{
    return item?item.name:undefined
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for (let propName in changes) {
      if(propName==="selectedPerson" && changes['selectedPerson'].currentValue !== undefined){
        // console.log(changes['selectedPerson'].currentValue);
        if(this.displayMode === "dropdown"){
          this.personControl.setValue(changes['selectedPerson'].currentValue.name);
        }
      } 
    }
  }

  onEditClick(person){
    const dialogRef = this.dialog.open(PersonAddEditComponent, {
      data: {
        "person": person
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        this.selectedPerson = result;
        this.notifier.notify("success", this.selectedPerson.name+" updated successfully");
        // this.openSnackBar(this.selectedPerson.name+" updated successfully", "Dismiss");
      }
      
    });
  }

  openResetPasswordDialog(person){
    const dialogRef = this.dialog.open(
      ResetPasswordComponent,{
        data: {personId: person.id}
      }
    );

    dialogRef.afterClosed().subscribe(result=>{
      if(result['success']){
        this.notifier.notify("success", "Password resetted successfully");
      }
    });
  }
}
