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

import { UserMetaService } from './usermeta.service';

describe('UserMetaService', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj('HttpClient', ['get']),
        },
        {
          provide: MOCK_COOKIE_SERVICE_CONFIG,
          useValue: {},
        },
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
          },
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

  it('should get read count', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userMetaService = TestBed.inject(UserMetaService);

      httpClientSpy.get.and.returnValue(of(1000));

      const readCount = await firstValueFrom(userMetaService.getReadCount());

      expect(readCount).toEqual(1000);
    });
  }));
});
