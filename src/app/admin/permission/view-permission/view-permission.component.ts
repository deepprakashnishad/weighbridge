import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Permission } from '../permission';
import { PermissionService } from '../permission.service';
import { AddEditPermissionComponent } from '../add-edit-permission/add-edit-permission.component';

@Component({
  selector: 'app-view-permission',
  templateUrl: './view-permission.component.html',
  styleUrls: ['./view-permission.component.scss']
})
export class ViewPermissionComponent implements OnInit {

	@Input() permissions: Array<Permission>;
	@Input() isEditPermitted: boolean = false;

	filterStr:string = '';

  constructor(
    private dialog: MatDialog,
    public snackBar: MatSnackBar,
    private permissionService: PermissionService
  ) { }

  ngOnInit() {
  }

  openAddEditPermissionDialog(permission){
  	const dialogRef = this.dialog.open(AddEditPermissionComponent, {
      data: {
        permission: permission
      }
    });

  	dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
    });
  }

  deletePermission(permission){
    const index = this.permissions.indexOf(permission);
    this.permissionService.deletePermission(permission.id)
    .subscribe(permission=>{
      this.permissions.splice(index, 1);
      this.openSnackBar('Permission deleted successfully', 'Dismiss');
    })
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }
}
