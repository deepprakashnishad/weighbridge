import { Component, OnInit, ViewChild } from '@angular/core';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {PersonService} from './person.service';
import {Person} from './person';
import { PersonAddEditComponent } from './person-add-edit/person-add-edit.component';
import {FormControl} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnInit {
	personList: Array<Person>;
	filteredPersons: Person[];
	selectedPerson: Person;
	filterStr:string = '';
  limit: number;
  offset: number;

  constructor(
    private personService: PersonService,
    private dialog: MatDialog,
    public snackBar: MatSnackBar,
    private notifier: NotifierService
  ) { 
  }

  ngOnInit() {
  }

  personSelected($event){
  	this.selectedPerson = $event;
  }

  onAddClick(){
    const dialogRef = this.dialog.open(PersonAddEditComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if(result !== false){
        this.selectedPerson = result;
        // this.personControl.setValue(this.selectedPerson);
        this.openSnackBar(this.selectedPerson.name+" created successfully", "Dismiss");
      }
    });
  }

  onEditClick(){
    const dialogRef = this.dialog.open(PersonAddEditComponent, {
      data: {
        person: this.selectedPerson
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

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  openResetPasswordDialog(){
    const dialogRef = this.dialog.open(
      ResetPasswordComponent,{
        data: {personId: this.selectedPerson.id}
      }
    );

    dialogRef.afterClosed().subscribe(result=>{
      if(result['success']){
        this.notifier.notify("success", "Password resetted successfully");
      }
    });
  }
}
