import { HttpClient, HttpResponse } from '@angular/common/http';
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

import { OPMLService } from './opml.service';

describe('OPMLService', () => {
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

  it('should download', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const opmlService = TestBed.inject(OPMLService);

      const downloadText = '<opml></opml>'; // not real OPML

      httpClientSpy.get.and.returnValue(of(downloadText));

      const xmlText = await firstValueFrom(opmlService.download());

      expect(xmlText).toBe(downloadText);
    });
  }));

  it('should upload text', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const opmlService = TestBed.inject(OPMLService);

      const response = new HttpResponse({
        status: 200,
      });

      httpClientSpy.post.and.returnValue(of(response));

      const response_ = await firstValueFrom(
        opmlService.upload('<opml></opml>'),
      );

      expect(response_.status).toBe(200);
    });
  }));

  it('should upload buffer', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const opmlService = TestBed.inject(OPMLService);

      const response = new HttpResponse({
        status: 200,
      });

      httpClientSpy.post.and.returnValue(of(response));

      const response_ = await firstValueFrom(
        opmlService.upload(new ArrayBuffer(100)),
      );

      expect(response_.status).toBe(200);
    });
  }));
});
