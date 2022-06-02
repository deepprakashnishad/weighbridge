import { NgModule } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import {AuthGuardService} from './authentication/auth-guard.service';
import {CanDeactivateGuardService} from './authentication/can-deactivate-guard.service';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { PermissionComponent } from './admin/permission/permission.component';
import { RoleComponent } from './admin/role/role.component';
import { ActivityLogComponent } from './admin/activity-log/activity-log.component';
import { DbBackupComponent } from './admin/db-backup/db-backup.component';
import { WeighmentComponent } from './weighment/weighment.component';
import { VehicleSetupComponent } from './weighment/vehicle-setup/vehicle-setup.component';

const routes: Routes = [
	{
		path: 'home', 
		component: HomeComponent,
		data: { title: 'Home', permissions: []}
	},
	{
		path: 'permission', 
		component: PermissionComponent,
		canActivate: [AuthGuardService], 
		canDeactivate:[CanDeactivateGuardService],
		data: { title: 'Permission', permissions: []}
	},	

	{
		path: 'role', 
		component: RoleComponent,
		canActivate: [AuthGuardService], 
		canDeactivate:[CanDeactivateGuardService],
		data: { title: 'Role', permissions: []}
	},
	{
		path: 'activity-log', 
		component: ActivityLogComponent,
		canActivate: [AuthGuardService], 
		canDeactivate:[CanDeactivateGuardService],
		data: { title: 'Activity Log'}
	},
	{
		path: 'db-backup', 
		component: DbBackupComponent,
		canActivate: [AuthGuardService], 
		canDeactivate:[CanDeactivateGuardService],
		data: { title: 'DB Backup'}
	},
	{
		path: 'weighment', 
		component: WeighmentComponent,
		canActivate: [AuthGuardService], 
		canDeactivate:[CanDeactivateGuardService],
		data: { title: 'Weighment'}
  },
  {
    path: 'vehicle-setup',
    component: VehicleSetupComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [CanDeactivateGuardService],
    data: { title: 'Vehicle Setup' }
  },
	{path: 'person', loadChildren: './../person/person.module#PersonModule', canLoad: [AuthGuardService],
		data:{title: 'Person', resources: ['CREATE_PERSON', 'UPDATE_PERSON', 'DELETE_PERSON']}},
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
  	enableTracing: false,
  })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
