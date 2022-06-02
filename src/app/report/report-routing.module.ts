import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './../authentication/auth-guard.service';
import { CanDeactivateGuardService } from './../authentication/can-deactivate-guard.service';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { CompleteWeighmentReportComponent } from './complete-weighment-report/complete-weighment-report.component';
import { CustomReportsComponent } from './custom-reports/custom-reports.component';
import { DailyCollectionReportComponent } from './daily-collection-report/daily-collection-report.component';
import { NotificationLogComponent } from './notification-log/notification-log.component';
import { ReportComponent } from './report.component';
import { TheftDetectionReportComponent } from './theft-detection-report/theft-detection-report.component';
import { WastedReportComponent } from './wasted-report/wasted-report.component';
import { WeighmentReportComponent } from './weighment-report/weighment-report.component';
import { ZeroCheckReportComponent } from './zero-check-report/zero-check-report.component';

const routes: Routes = [
	
	{
		path: 'reports', 
		component: ReportComponent,
		data: { title: 'Reports'},
		children: [
			{
				path: '', 
				component: WeighmentReportComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Weighment report', permissions: []}
      },
      {
        path: 'wasted-report',
        component: WastedReportComponent,
        canActivate: [AuthGuardService],
        canDeactivate: [CanDeactivateGuardService],
        data: { title: 'Wasted report', permissions: [] }
      },
			{
				path: 'audit-log', 
				component: AuditLogComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Audit log', permissions: []}
      },
      {
        path: 'complete-weighment-report',
        component: CompleteWeighmentReportComponent,
        canActivate: [AuthGuardService],
        canDeactivate: [CanDeactivateGuardService],
        data: { title: 'Complete Weighment Report', permissions: [] }
      },
			{
				path: 'custom-reports', 
				component: CustomReportsComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Custom report', permissions: []}
			},
			{
				path: 'daily-collection-report', 
				component: DailyCollectionReportComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Daily collection report', permissions: []}
			},
			{
				path: 'zero-check-report', 
				component: ZeroCheckReportComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Zero check report', permissions: []}
			},
			{
				path: 'notification-log', 
				component: NotificationLogComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Notification log', permissions: []}
			},
			{
				path: 'theft-detection-report', 
				component: TheftDetectionReportComponent,
				canActivate: [AuthGuardService], 
				canDeactivate:[CanDeactivateGuardService],
				data: { title: 'Theft detection report', permissions: []}
			},
		]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
