/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WeighIndicatorStringComponent } from './weigh-indicator-string.component';

describe('WeighIndicatorStringComponent', () => {
  let component: WeighIndicatorStringComponent;
  let fixture: ComponentFixture<WeighIndicatorStringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeighIndicatorStringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeighIndicatorStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
