import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {HttpClientModule } from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import { AuthenticationModule } from './authentication/authentication.module';
import {SharedModule} from './shared/shared.module';
import { AppComponent } from './app.component';
import { httpInterceptorProviders } from './http-interceptors/index';
import { NavigationComponent } from './navigation/navigation.component';
import { NotifierModule, NotifierOptions } from 'angular-notifier';
import { AdminModule } from './admin/admin.module';
import { HomeComponent } from './home/home.component';
import { WeighbridgeRecordComponent } from './weighbridge-record/weighbridge-record.component';
import { ReportModule } from './report/report.module';
import { WeighmentComponent } from './weighment/weighment.component';
import { WeighmentSummaryComponent } from './weighment/weighment-summary/weighment-summary.component';
import { WeighmentDetailComponent } from './weighment/weighment-details/weighment-details.component';
import { InitialSetupComponent } from './admin/initial-setup/initial-setup.component';
import { WeighmentSearchDialog } from './weighment/weighment-search-dialog/weighment-search-dialog.component';
import { LicenseMaskDirective } from './directives/license-mask';
import { VehicleMaskDirective } from './directives/vehicle-mask';
import { VehicleSetupComponent } from './weighment/vehicle-setup/vehicle-setup.component';

const notifierDefaultOptions: NotifierOptions = {
  position: {
      horizontal: {
          position: "right",
          distance: 12
      },
      vertical: {
          position: "bottom",
          distance: 12,
          gap: 10
      }
  },
  theme: "material",
  behaviour: {
      autoHide: 3000,
      onClick: false,
      onMouseover: "pauseAutoHide",
      showDismissButton: true,
      stacking: 4
  },
  animations: {
      enabled: true,
      show: {
          preset: "slide",
          speed: 300,
          easing: "ease"
      },
      hide: {
          preset: "fade",
          speed: 1000,
          easing: "ease",
      },
      shift: {
          speed: 300,
          easing: "ease"
      },
      overlap: 150
  }
};

@NgModule({
  declarations: [							
    AppComponent,
    NavigationComponent,
    HomeComponent,
    WeighbridgeRecordComponent,
    WeighmentComponent,
    WeighmentDetailComponent,
    WeighmentSummaryComponent,
    WeighmentSearchDialog,
    InitialSetupComponent,
    LicenseMaskDirective,
    VehicleMaskDirective,
    VehicleSetupComponent
   ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AuthenticationModule,
    NotifierModule.withConfig(notifierDefaultOptions),
    AdminModule,
    ReportModule,
    SharedModule,
    AppRoutingModule,
  ],
  exports: [InitialSetupComponent],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
