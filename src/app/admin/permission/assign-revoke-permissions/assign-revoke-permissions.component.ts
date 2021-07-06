import { 
	Component, 
	OnInit, 
	Input, 
	Output, 
	EventEmitter, 
	OnChanges, 
	SimpleChange 
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { PermissionService } from '../permission.service';
import { Permission } from '../permission';

@Component({
  selector: 'app-assign-revoke-permissions',
  templateUrl: './assign-revoke-permissions.component.html',
  styleUrls: ['./assign-revoke-permissions.component.scss']
})
export class AssignRevokePermissionsComponent implements OnInit {

	private testStr: string
	@Input() grantedPermissions: Array<Permission>;
	@Output() grantedPermissionModified = new EventEmitter<Array<Permission>>();
	restrictedPermissions: Array<Permission> = []
  completePermissionList: Array<Permission>
  selectedGrantPermissionList: Array<any> = []
  selectedRevokePermissionList: Array<any> = []

  	updateRestrictedPermissions(){
  		const grantedPermissionsIds = this.grantedPermissions.map(el=>el.id);

  		if(this.completePermissionList !== undefined){
  			this.restrictedPermissions = this.completePermissionList.filter(
		        (el) => {
		          return !grantedPermissionsIds.includes(el.id);
		        }
		    );
  		}
  	}

  	ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
  		this.updateRestrictedPermissions();
  	}

  	constructor(
  		private permissionService: PermissionService,
  		private snackBar: MatSnackBar,
  	) { 
  	}

  	ngOnInit() {
  		this.permissionService.getPermissions()
	  	.subscribe((permissions)=>{
	  		this.completePermissionList = permissions;
	  		let grantedPermissionsIds = this.grantedPermissions.map(el => el.id);
			  this.updateRestrictedPermissions();	  	
 	  	});
  	}

  	drop(event: CdkDragDrop<Permission[]>) {
	    if (event.previousContainer === event.container) {
	      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
	    } else {
	      transferArrayItem(event.previousContainer.data,
	                        event.container.data,
	                        event.previousIndex,
	                        event.currentIndex);
	      this.notifyGrantedPermissionModified();
	    }
	  }

  	revokeAllPermissions(){
	    this.grantedPermissions = [];
	    this.restrictedPermissions = this.completePermissionList;
	    this.notifyGrantedPermissionModified();
	}

  grantAllPermissions(){
    this.grantedPermissions = this.completePermissionList;
    this.restrictedPermissions = [];
    this.notifyGrantedPermissionModified();
  }

  grantPermissions(){
    for(let i=0;i<this.selectedGrantPermissionList.length;i++){
      const permission = this.selectedGrantPermissionList[i].value;
      this.restrictedPermissions.splice(this.restrictedPermissions.indexOf(permission),1);
      this.grantedPermissions.push(permission);
    }
    this.notifyGrantedPermissionModified();
  }

  revokePermissions(){
    for(let i=0;i<this.selectedRevokePermissionList.length;i++){
      const permission = this.selectedRevokePermissionList[i].value;
      this.grantedPermissions.splice(this.grantedPermissions.indexOf(permission),1);
      this.restrictedPermissions.push(permission);
    }
    this.notifyGrantedPermissionModified(); 
  }

  onGrantPermissionChange($event, selectedPermissions){
  	this.selectedGrantPermissionList = selectedPermissions;
  }

  onRevokePermissionChange($event, selectedPermissions){
  	this.selectedRevokePermissionList = selectedPermissions;
  }

  notifyGrantedPermissionModified(){
    this.grantedPermissionModified.emit(this.grantedPermissions);
  }
}
