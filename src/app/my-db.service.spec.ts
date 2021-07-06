/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MyDbService } from './my-db.service';

describe('Service: MyDb', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyDbService]
    });
  });

  it('should ...', inject([MyDbService], (service: MyDbService) => {
    expect(service).toBeTruthy();
  }));
});
