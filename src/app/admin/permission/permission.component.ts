import { Component, OnInit } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddEditPermissionComponent } from './add-edit-permission/add-edit-permission.component';
import { AuthenticationService } from './../../authentication/authentication.service';
import { PermissionService } from './permission.service';
import { Permission } from './permission';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit {

	permissions: Array<Permission>
  isEditPermitted: boolean = false;
  isAddPermitted: boolean = false;

  constructor(
  	private permissionService: PermissionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
  	this.permissionService.getPermissions()
  	.subscribe((permissions)=>{
  		this.permissions = permissions;
  	});

    this.isAddPermitted = this.authenticationService
      .authorizeUser(['CREATE_PERMISSION']);
    this.isEditPermitted = this.authenticationService
      .authorizeUser(['UPDATE_PERMISSION', 'DELETE_PERMISSION']);
      console.log(this.isAddPermitted);
  }

  openAddEditPermissionDialog(permission){
    const dialogRef = this.dialog.open(AddEditPermissionComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        this.permissions.push(result.permission);
        this.snackBar.open(
          result.msg, "Dismiss", {
          duration: 5000
        });
      }
    });
  }
}
