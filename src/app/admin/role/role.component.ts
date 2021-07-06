import { Component, OnInit } from '@angular/core';
import { RoleService } from './role.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DialogService } from './../../shared/confirm-dialog/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Role} from './role';
import {Permission} from './../permission/permission';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {
 	errors: Array<string> = [];
	selectedRole: Role
	roles: Array<Role>
  roleForDeletion: Role
	roleForm: FormGroup
  grantedPermissions: Array<Permission> = []
  restrictedPermissions: Array<Permission> = []

  	constructor(
  		private roleService: RoleService,
  		private fb: FormBuilder,
      private snackBar: MatSnackBar,
      private dialogService: DialogService
 	) {
  		this.roleForm = fb.group({
  				name: ['', [Validators.required]],
  				description: ['']
  			});
 	}

  ngOnInit() {
  	this.getRoles();
  }

  select(role) {
  	this.selectedRole = role;
    this.roleForm.setValue({
      name: role.name,
      description: role.description
    });

    this.grantedPermissions = role.permissions;
    
  }

  getRoles(): void {
    this.roleService.getRoles().subscribe(
      roles => {
        this.roles = roles;
        this.select(roles[0]);
      }
    );
  }

  save():void{
    if(this.selectedRole !==null && this.selectedRole !==undefined && this.roleForm.valid){
      this.update()
    }else if((this.selectedRole === null || this.selectedRole === undefined) 
              && this.roleForm.valid && this.roleForm.dirty){
      this.addRole()     
    }
  }

  addRole(): void {
    const role = this.roleForm.value
  	this.roleService.addRole(role).subscribe((res) =>  {
  		const role: Role = res;
  		this.roles.push(role);
      this.openSnackBar("Role added successfully", "Dismiss")
      this.resetForm()
  	}, (error) =>  {
  		this.errors.push(error.error.msg);
  	});
  }

  update(): void{
    let role:Role = this.roleForm.value
    role.id = this.selectedRole.id
    this.roleService.updateRole(role).subscribe((role) =>  {
      const index = this.roles.indexOf(this.selectedRole)
      this.roles[index].name = role[0].name
      this.openSnackBar("Role updated successfully", "Dismiss")
      this.resetForm()
    }, (error) =>  {
      this.errors.push(error.error.raw.msg);
    }); 
  }

  onPermissionUpdate($event){
    this.grantedPermissions = $event;
    this.selectedRole.permissions = this.grantedPermissions;
    console.log(this.grantedPermissions);
    this.roleService.updateRolePermissions(this.selectedRole)
    .subscribe((role)=>{
      this.openSnackBar("Role permissions updated successfully", "Dismiss")
    });
  }

  delete(role, index): void {
    this.roleForDeletion = role;
    this.openConfirmDialog("Confirm Delete", `Are you sure to delete ${role.shortName} role`);
  }

  deletionRoleConfirmed(){
    this.roleService.deleteRole(this.roleForDeletion.id).subscribe((res) =>  {
      this.roles.splice(this.roles.indexOf(this.roleForDeletion), 1);
      this.openSnackBar("Role deleted successfully", "Dismiss")
    }, (error) =>  {
      if(error.error.raw){
        this.errors.push(error.error.raw.msg);
      }else if(error.error.msg){
        this.errors.push(error.error.msg.msg);
      }else{
        this.errors.push("Some error occurred");
      }
    });
  }

  openConfirmDialog(title, message){
    let res1
    this.dialogService
      .confirm(title, message)
      .subscribe(res => {
          if(res){
            this.deletionRoleConfirmed()
          }
      });
  }

  resetForm():void{
    this.roleForm.reset()
    this.roleForm.markAsPristine()
    this.roleForm.markAsUntouched()
    this.roleForm.updateValueAndValidity()
    this.selectedRole = null
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  canDeactivate(): Observable<boolean> | boolean{
    if(this.roleForm.pristine){
      return true
    }
    return this.dialogService.confirm("Discard Changes?", "Are you sure to discard changes?")
  }
}
