import { Component, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Person } from './../person';
import { Role } from './../../admin/role/role';
import { PersonService } from './../person.service';
import { RoleService } from './../../admin/role/role.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-person-add-edit.component',
  templateUrl: './person-add-edit.component.html',
  styleUrls: ['./person-add-edit.component.scss']
})
export class PersonAddEditComponent implements OnInit {

  personForm: FormGroup;
  person: Person;
  title: string;
  errors: Array<string>=[];
  roles: Array<Role>

  constructor(
  	private PersonService: PersonService,
  	private fb: FormBuilder,
    private personService: PersonService,
    private roleService: RoleService,
    public snackBar: MatSnackBar,
    private notifier: NotifierService,
	  public dialogRef: MatDialogRef<PersonAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  	this.personForm = this.fb.group({
  		name: ['', Validators.required],
  		mobile: ['', [Validators.required]],
      email: [''],
      password: ['']
  	});

  	if(this.data && this.data.person){
  		this.person = this.data.person;
      this.title = "Edit " + this.data.person.name;
  	}else{
  		this.person = new Person();
      this.title = "Add New Person";
  	}

    this.roleService.getRoles().subscribe(
      roles => {
        this.roles = roles;
      }
    );
  }

  save(person){
  	if(person.id === undefined || person.id === null){
  		this.personService.add(person)
  		.subscribe((person)=>{
        this.person = person;
  			this.openSnackBar(person.name + " created successfully. Assign role and permissions", "Dismiss");
  		}, (error)=>{
  			this.errors.push(error.error.msg);
  		});
  	}else{
  		this.personService.update(person)
  		.subscribe((person)=>{
        person.permissions = this.person.permissions;
  			this.updatePersonPermission(person);
  		}, error=>{
  			this.errors.push(error.error.msg);
  		});
  	}
  }

  updatePersonPermission(person){
    this.personService.updatePermissions(person)
    .subscribe((person)=>{
      this.dialogRef.close(person);  
    }, (error)=>{
      this.errors.push("Person detail updated but failed to update permission");
    });    
  }

  selectRole(role: Role){
    this.person.role = role;
    this.person.permissions = role.permissions;
  }

  onPermissionUpdate($event){
    this.person.permissions = $event;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  generatePassword(){
    this.person.password = Math.random().toString(36).slice(-10);
  }

  copied(){
    this.notifier.notify("success", "Password copied to clipboard");
  }
}
