import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom, of } from 'rxjs';

import { ZUser } from '@app/models/user';
import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>('HttpClient', [
            'get',
            'post',
            'put',
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

  it('should login', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const authService = TestBed.inject(AuthService);
      httpClientSpy.post.and.returnValue(
        of({
          key: '',
        }),
      );

      const response = await firstValueFrom(
        authService.login('test@test.com', 'password', false),
      );
      expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        jasmine.stringMatching(/\/api\/auth\/login$/),
        jasmine.objectContaining({
          email: jasmine.any(String),
          password: jasmine.any(String),
        }),
        jasmine.any(Object),
      );
      expect(response).toEqual(
        jasmine.objectContaining({
          key: jasmine.any(String),
        }),
      );
    });
  }));

  it('should logout', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const mockCookieService = TestBed.inject(
        CookieService,
      ) as MockCookieService;
      const authService = TestBed.inject(AuthService);

      httpClientSpy.post.and.returnValue(of());
      mockCookieService.mockConfig = {
        'csrftoken': 'a-token',
      };

      await firstValueFrom(authService.logout(), { defaultValue: undefined });
      expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        jasmine.stringMatching(/\/api\/auth\/logout$/),
        undefined,
        jasmine.objectContaining({
          headers: jasmine.objectContaining({
            'X-CSRFToken': jasmine.any(String),
          }),
        }),
      );
    });
  }));

  it('should request', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const authService = TestBed.inject(AuthService);

      httpClientSpy.post.and.returnValue(of());

      await expectAsync(
        firstValueFrom(authService.requestPasswordReset('test@example.com'), {
          defaultValue: undefined,
        }),
      ).toBeResolved();
    });
  }));

  it('should reset', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const authService = TestBed.inject(AuthService);

      httpClientSpy.post.and.returnValue(of());

      await expectAsync(
        firstValueFrom(
          authService.resetPassword('a-token', 'a-user-id', 'newPassword1!'),
          { defaultValue: undefined },
        ),
      ).toBeResolved();
    });
  }));

  it('should get user', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const authService = TestBed.inject(AuthService);

      httpClientSpy.get.and.returnValue(
        of({
          uuid: '772893c2-c78f-42d8-82a7-5d56a1837a28',
          email: 'test@test.com',
          subscribedFeedUuids: [],
          attributes: {},
        }),
      );

      const user = await firstValueFrom(authService.getUser());
      expect(ZUser.safeParse(user).success).toBeTrue();
    });
  }));

  it('should update user attributes', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const authService = TestBed.inject(AuthService);

      httpClientSpy.put.and.returnValue(of());

      await expectAsync(
        firstValueFrom(authService.updateUserAttributes({}), {
          defaultValue: undefined,
        }),
      ).toBeResolved();
    });
  }));
});
