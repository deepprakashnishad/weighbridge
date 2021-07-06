import { NgModule,NO_ERRORS_SCHEMA } from '@angular/core';
import {AuthRoutingModule} from './auth-routing/auth-routing.module';
import {SharedModule} from '../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { RoleComponent } from '../admin/role/role.component';
import { PermissionComponent } from '../admin/permission/permission.component';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    SharedModule,
    AuthRoutingModule
  ],
  exports: [LoginComponent],
  schemas:[NO_ERRORS_SCHEMA]
})
export class AuthenticationModule { }
