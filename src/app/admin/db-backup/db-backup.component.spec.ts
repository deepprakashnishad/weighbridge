/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DbBackupComponent } from './db-backup.component';

describe('DbBackupComponent', () => {
  let component: DbBackupComponent;
  let fixture: ComponentFixture<DbBackupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbBackupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
