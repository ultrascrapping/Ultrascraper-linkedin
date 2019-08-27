import { TestBed } from '@angular/core/testing';

import { OsNotificationService } from './os-notification.service';

describe('OsNotificationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OsNotificationService = TestBed.get(OsNotificationService);
    expect(service).toBeTruthy();
  });
});
