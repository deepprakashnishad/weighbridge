import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './../authentication/auth-guard.service';
import { CanDeactivateGuardService } from './../authentication/can-deactivate-guard.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PermissionComponent } from './permission/permission.component';
import { RoleComponent } from './role/role.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { AdminComponent } from './admin/admin.component';
import { DataSetupComponent } from './data-setup/data-setup.component';
import { WeighbridgeSetupComponent } from './weighbridge-setup/weighbridge-setup.component';
import { PrinterSetupComponent } from './printer-setup/printer-setup.component';
import { TicketSetupComponent } from './ticket-setup/ticket-setup.component';
import { ReportSetupComponent } from './report-setup/report-setup.component';
import { EmailSetupComponent } from './email-setup/email-setup.component';
import { DbBackupComponent } from './db-backup/db-backup.component';

const routes: Routes = [
	
	{
		path: 'admin', 
		component: AdminComponent,
		canActivate: [AuthGuardService], 
    	canDeactivate:[CanDeactivateGuardService],
		data: { title: 'Administration', permissions: []},
		children: [
			{
				path: '', 
				component: DataSetupComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Data Setup', permissions: []}
			},
			{
				path: 'weighbridge-setup', 
				component: WeighbridgeSetupComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Data Setup', permissions: []}
			},
			{
				path: 'printer-setup', 
				component: PrinterSetupComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Printer Setup', permissions: []}
			},
			{
				path: 'ticket-setup', 
				component: TicketSetupComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Printer Setup', permissions: []}
			},
			{
				path: 'report-setup', 
				component: ReportSetupComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Report Setup', permissions: []}
			},
			{
				path: 'email-setup', 
				component: EmailSetupComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Email Setup', permissions: []}
			},
			{
				path: 'db-backup', 
				component: DbBackupComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'DB Backup', permissions: []}
			},
		]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
