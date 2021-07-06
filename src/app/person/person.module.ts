import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {PersonRoutingModule} from './person-routing/person-routing.module';
import {SharedModule} from './../shared/shared.module';
import { PersonComponent } from './person.component';
import { PersonSearchComponent} from './person-search/person-search.component';
import {PersonService} from './person.service';
import { PersonAddEditComponent } from './person-add-edit/person-add-edit.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
  declarations: [PersonComponent, PersonAddEditComponent, PersonSearchComponent, ResetPasswordComponent],
  imports: [
    SharedModule,
    PersonRoutingModule,
  ],
  entryComponents:[PersonAddEditComponent, ResetPasswordComponent],
  providers:[PersonService],
  exports: [PersonSearchComponent]
})
export class PersonModule { }
