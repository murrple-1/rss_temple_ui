import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom, of } from 'rxjs';

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
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>('HttpClient', [
            'get',
            'post',
          ]),
        },
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

  it('should report feeds', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const reportService = TestBed.inject(ReportService);

      httpClientSpy.post.and.returnValue(of());

      await firstValueFrom(
        reportService.reportFeed(
          '9dc9393a-6410-4848-9202-7ce4fd8cea61',
          'A reason to report',
        ),
        {
          defaultValue: undefined,
        },
      );

      expect().nothing();
    });
  }));

  it('should report feed entries', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const reportService = TestBed.inject(ReportService);

      httpClientSpy.post.and.returnValue(of());

      await firstValueFrom(
        reportService.reportFeedEntry(
          '2eea97c8-f5da-4bb2-ab98-519b6c1f1145',
          'A reason to report',
        ),
        {
          defaultValue: undefined,
        },
      );

      expect().nothing();
    });
  }));
});
