/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ActivityLogService } from './activity-log.service';

describe('Service: ActivityLog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivityLogService]
    });
  });

  it('should ...', inject([ActivityLogService], (service: ActivityLogService) => {
    expect(service).toBeTruthy();
  }));
});
