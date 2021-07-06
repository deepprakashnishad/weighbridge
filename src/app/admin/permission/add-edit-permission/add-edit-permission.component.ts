import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Permission } from '../permission';
import { PermissionService } from '../permission.service';

@Component({
  selector: 'app-add-edit-permission',
  templateUrl: './add-edit-permission.component.html',
  styleUrls: ['./add-edit-permission.component.scss']
})
export class AddEditPermissionComponent implements OnInit {

	errors: Array<string> = [];
	permissionForm: FormGroup;
	permission: Permission;
  title: string;
 
  constructor(
  	private permissionService: PermissionService,
  	private fb: FormBuilder,
  	public dialogRef: MatDialogRef<AddEditPermissionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  	this.permissionForm = this.fb.group({
  		permission: ['', Validators.required],
  		description: ['']
  	});

  	if(this.data && this.data.permission){
  		this.permission = this.data.permission;
      this.title = "Edit " + this.data.permission.permission;
  	}else{
  		this.permission = new Permission();
      this.title = "Add New Permission";
  	}
  }

  save(permission){
  	permission.permission = permission.permission.toUpperCase();
  	if(permission.id === undefined || permission.id === null){
  		this.permissionService.addPermission(permission)
  		.subscribe((permission)=>{
  			this.dialogRef.close({permission, msg: permission.permission+" permission created successfully"});
  		}, (err)=>{
        alert(err.error.msg);
      });
  	}else{
  		this.permissionService.updatePermission(permission)
  		.subscribe((permission)=>{
  			this.dialogRef.close({permission, msg: permission.permission+" permission updated successfully"});
  		}, error=>{
  			this.errors.push(error.error.msg);
  		});
  	}
  }
}
