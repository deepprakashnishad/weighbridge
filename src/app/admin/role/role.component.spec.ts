import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MaterialModule } from './../../material.module';
import { RoleComponent } from './role.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';

import { RoleService } from './role.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DialogService } from './../../shared/dialog/dialog.service';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';


describe('RoleComponent', () => {
  let component: RoleComponent;
  let fixture: ComponentFixture<RoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        MaterialModule
      ],
      providers:[RoleService, FormBuilder, MatSnackBar, DialogService],
      declarations: [ RoleComponent ],
      schemas:[NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
