import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';

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

  it('should download', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const opmlService = TestBed.inject(OPMLService);

    const downloadText = '<opml></opml>'; // not real OPML

    const xmlTextPromise = firstValueFrom(opmlService.download());

    const req = httpTesting.expectOne({
      url: '/api/opml',
      method: 'GET',
    });
    req.flush(downloadText);

    await expectAsync(xmlTextPromise).toBeResolvedTo(downloadText);
  }));

  it('should upload text', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const opmlService = TestBed.inject(OPMLService);

    const uploadPromise = firstValueFrom(opmlService.upload('<opml></opml>'));

    const req = httpTesting.expectOne({
      url: '/api/opml',
      method: 'POST',
    });
    req.flush(null, {
      statusText: 'OK',
      status: 200,
    });

    const upload = await uploadPromise;

    expect(upload.status).toBe(200);
  }));

  it('should upload buffer', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const opmlService = TestBed.inject(OPMLService);

    const uploadPromise = firstValueFrom(
      opmlService.upload(new ArrayBuffer(100)),
    );

    const req = httpTesting.expectOne({
      url: '/api/opml',
      method: 'POST',
    });
    req.flush(null, {
      statusText: 'OK',
      status: 200,
    });

    const upload = await uploadPromise;

    expect(upload.status).toBe(200);
  }));
});
