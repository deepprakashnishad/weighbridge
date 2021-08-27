import { NgModule } from '@angular/core';
import { ReportComponent } from './report.component';
import { SharedModule } from '../shared/shared.module';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { CustomReportsComponent } from './custom-reports/custom-reports.component';
import { DailyCollectionReportComponent } from './daily-collection-report/daily-collection-report.component';
import { NotificationLogComponent } from './notification-log/notification-log.component';
import { TheftDetectionReportComponent } from './theft-detection-report/theft-detection-report.component';
import { ZeroCheckReportComponent } from './zero-check-report/zero-check-report.component';
import { ReportRoutingModule } from './report-routing.module';
import { WeighmentReportComponent } from './weighment-report/weighment-report.component';
import { PreviewDialogComponent } from './preview-dialog/preview-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    ReportRoutingModule
  ],
  declarations: [
    ReportComponent,
    AuditLogComponent,
    CustomReportsComponent,
    DailyCollectionReportComponent,
    NotificationLogComponent,
    TheftDetectionReportComponent,
    WeighmentReportComponent,
    ZeroCheckReportComponent,
    PreviewDialogComponent
  ],
  exports: [
  ],
  entryComponents:[
  ],
  providers:[]
})
export class ReportModule { }
