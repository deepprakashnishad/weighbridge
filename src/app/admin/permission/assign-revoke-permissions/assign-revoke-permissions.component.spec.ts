import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignRevokePermissionsComponent } from './assign-revoke-permissions.component';

describe('AssignRevokePermissionsComponent', () => {
  let component: AssignRevokePermissionsComponent;
  let fixture: ComponentFixture<AssignRevokePermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignRevokePermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignRevokePermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
