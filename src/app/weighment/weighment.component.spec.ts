/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WeighmentComponent } from './weighment.component';

describe('WeighmentComponent', () => {
  let component: WeighmentComponent;
  let fixture: ComponentFixture<WeighmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeighmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeighmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
