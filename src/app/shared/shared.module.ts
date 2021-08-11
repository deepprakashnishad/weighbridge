import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from './../material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProgressSpinnerComponent } from './progress-spinner/progress-spinner/progress-spinner.component';
import { AssignRevokePermissionsComponent } from '../admin/permission/assign-revoke-permissions/assign-revoke-permissions.component';
import { AddEditPermissionComponent } from '../admin/permission/add-edit-permission/add-edit-permission.component';
import { ViewPermissionComponent } from '../admin/permission/view-permission/view-permission.component';
import { CapitalizeFirstLetterDirective } from '../directives/capitalize-first-letter.directive';
import { CapitalizeDirective } from '../directives/capitalize.directive';
import { MyFilterPipe } from './pipes/my-filter.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { NgxElectronModule } from 'ngx-electron';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TagSelectorComponent } from './tag-selector/tag-selector.component';
import { ListEditorComponent } from './list-editor/list-editor.component';
import { HtmlViewerComponent } from './html-viewer/html-viewer.component';
import { HelpComponent } from './help/help.component';

@NgModule({
  declarations: [
    ProgressSpinnerComponent, 
    AssignRevokePermissionsComponent, 
    AddEditPermissionComponent, 
    ViewPermissionComponent, 
    CapitalizeFirstLetterDirective, 
    CapitalizeDirective, 
    MyFilterPipe, 
    SafeHtmlPipe, 
    SafeUrlPipe,
    ConfirmDialogComponent,
    TagSelectorComponent,
    ListEditorComponent,
    HtmlViewerComponent,
    HelpComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaterialTimepickerModule,
    NgxElectronModule,
  ],
  exports:[
  	ProgressSpinnerComponent, 
  	FormsModule,
  	ReactiveFormsModule,
  	FlexLayoutModule, 
  	MaterialModule,
  	CommonModule,
    NgxElectronModule,
  	AssignRevokePermissionsComponent,
  	AddEditPermissionComponent,
  	ViewPermissionComponent,
    TagSelectorComponent,
    ListEditorComponent,
  	CapitalizeFirstLetterDirective,
  	CapitalizeDirective,
  	MyFilterPipe,
  	SafeHtmlPipe,
  	SafeUrlPipe,
    NgxMaterialTimepickerModule,
    HtmlViewerComponent,
    HelpComponent
  ],
  entryComponents:[AddEditPermissionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
