import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppAlertsService } from './app-alerts.service';

describe('AppAlertsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppAlertsService],
    });
  });

  it('should construct', () => {
    const appAlertsService = TestBed.inject(AppAlertsService);

    expect(appAlertsService).not.toBeNull();
  });
});
