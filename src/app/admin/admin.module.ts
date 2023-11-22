import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';
import { RoleComponent } from './role/role.component';
import { PermissionComponent } from './permission/permission.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { AdminComponent } from './admin/admin.component';
import { DataSetupComponent } from './data-setup/data-setup.component';
import { AdminRoutingModule } from './admin-routing.module';
import { FeaturesComponent } from './data-setup/features/features.component';
import { AdditionalFieldsComponent } from './data-setup/additional-fields/additional-fields.component';
import { ChallanWeightCheckComponent } from './data-setup/challan-weight-check/challan-weight-check.component';
import { SearchFieldsComponent } from './data-setup/search-fields/search-fields.component';
import { TrackingFieldsComponent } from './data-setup/tracking-fields/tracking-fields.component';
import { CreateEditAdditionalFieldComponent } from './data-setup/additional-fields/create-edit-additional-field/create-edit-additional-field.component';
import { WeighbridgeSetupComponent } from './weighbridge-setup/weighbridge-setup.component';
import { WeighbridgeSystemSetupComponent } from './weighbridge-setup/weighbridge-system-setup/weighbridge-system-setup.component';
import { WeighingIndicatorsComponent } from './weighbridge-setup/weighing-indicators/weighing-indicators.component';
import { CreateEditWeightStringComponent } from './weighbridge-setup/weigh-indicator-string/create-edit-weight-string/create-edit-weight-string.component';
import { WeighIndicatorStringComponent } from './weighbridge-setup/weigh-indicator-string/weigh-indicator-string.component';
import { CreateEditWeighIndicatorComponent } from './weighbridge-setup/weighing-indicators/create-edit-weigh-indicator/create-edit-weigh-indicator.component';
import { PrinterSetupComponent } from './printer-setup/printer-setup.component';
import { TicketSetupComponent } from './ticket-setup/ticket-setup.component';
import { CreateEditTicketTemplateComponent } from './ticket-setup/create-edit-ticket-template/create-edit-ticket-template.component';
import { ReportSetupComponent } from './report-setup/report-setup.component';
import { EmailSetupComponent } from './email-setup/email-setup.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { DbBackupComponent } from './db-backup/db-backup.component';
import { TagChipInputComponent } from './tag-chip-input/tag-chip-input.component';
import { PreviewDialogComponent } from './ticket-setup/preview-dialog/preview-dialog.component';
import { UserManagement } from './user-management/user-management.component';
import { AddEditUserDialogComponent } from './user-management/add-edit-user-dialog/add-edit-user-dialog.component';
import { SapConfigComponent } from './sap-config/sap-config.component';
import { FieldSetupComponent } from './data-setup/field-setup/field-setup.component';
import { WeighmentTypesComponent } from './data-setup/weighment-types/weighment-types.component';
import { CameraSetupComponent } from './camera-setup/camera-setup.component';

@NgModule({
  declarations: [
    RoleComponent,
    PermissionComponent,
    AdminComponent,
    DataSetupComponent,
    ActivityLogComponent,
    FeaturesComponent,
    AdditionalFieldsComponent,
    ChallanWeightCheckComponent,
    FeaturesComponent,
    SearchFieldsComponent,
    TrackingFieldsComponent,
    CreateEditAdditionalFieldComponent,
    WeighbridgeSetupComponent,
    WeighbridgeSystemSetupComponent,
    WeighingIndicatorsComponent,
    WeighIndicatorStringComponent,
    CreateEditWeightStringComponent,
    CreateEditWeighIndicatorComponent,
    PrinterSetupComponent,
    PreviewDialogComponent,
    TicketSetupComponent,
    CreateEditTicketTemplateComponent,
    ReportSetupComponent,
    EmailSetupComponent,
    DbBackupComponent,
    TagChipInputComponent,
    UserManagement,
    AddEditUserDialogComponent,
    SapConfigComponent,
    FieldSetupComponent,
    WeighmentTypesComponent,
    CameraSetupComponent
  ],
  imports: [
    SharedModule,
    ColorPickerModule,
    AdminRoutingModule
  ],
  exports: [
  ],
  entryComponents:[
  ],
  providers:[]
})
export class AdminModule { }
