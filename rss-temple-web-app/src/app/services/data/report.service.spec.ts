import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { ReportService } from './report.service';

describe('ReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
          },
        },
        {
          provide: MOCK_COOKIE_SERVICE_CONFIG,
          useValue: {},
        },
        {
          provide: CookieService,
          useClass: MockCookieService,
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    });
  });

  afterEach(() => {
    const httpTesting = TestBed.inject(HttpTestingController);
    httpTesting.verify();
  });

  it('should report feeds', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const reportService = TestBed.inject(ReportService);

    const reportPromise = firstValueFrom(
      reportService.reportFeed(
        '9dc9393a-6410-4848-9202-7ce4fd8cea61',
        'A reason to report',
      ),
      {
        defaultValue: undefined,
      },
    );

    const req = httpTesting.expectOne({
      url: '/api/report/feed',
      method: 'POST',
    });
    req.flush(null);

    await expect(reportPromise).resolves.not.toThrow();
  });

  it('should report feed entries', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const reportService = TestBed.inject(ReportService);

    const reportPromise = firstValueFrom(
      reportService.reportFeedEntry(
        '2eea97c8-f5da-4bb2-ab98-519b6c1f1145',
        'A reason to report',
      ),
      {
        defaultValue: undefined,
      },
    );

    const req = httpTesting.expectOne({
      url: '/api/report/feedentry',
      method: 'POST',
    });
    req.flush(null);

    await expect(reportPromise).resolves.not.toThrow();
  });
});
