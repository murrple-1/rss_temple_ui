import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

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

  it('should login', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const authService = TestBed.inject(AuthService);

    const responsePromise = firstValueFrom(
      authService.login('test@test.com', 'password', false),
    );

    const req = httpTesting.expectOne({
      url: '/api/auth/login',
      method: 'POST',
    });
    expect(req.request.body).toEqual(
      expect.objectContaining({
        email: expect.any(String),
        password: expect.any(String),
      }),
    );
    req.flush({
      key: '',
    });

    await expect(responsePromise).resolves.toEqual(
      expect.objectContaining({
        key: expect.any(String),
      }),
    );
  });

  it('should logout', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const mockCookieService = TestBed.inject(
      CookieService,
    ) as MockCookieService;
    const authService = TestBed.inject(AuthService);

    mockCookieService.mockConfig = {
      'csrftoken': 'a-token',
    };

    const logoutPromise = firstValueFrom(authService.logout(), {
      defaultValue: undefined,
    });

    const req = httpTesting.expectOne({
      url: '/api/auth/logout',
      method: 'POST',
    });
    expect(req.request.headers.has('X-CSRFToken')).toBe(true);
    req.flush(null);

    await expect(logoutPromise).resolves.not.toThrow();
  });

  it('should request', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const authService = TestBed.inject(AuthService);

    const requestPasswordResetPromise = firstValueFrom(
      authService.requestPasswordReset('test@example.com'),
      {
        defaultValue: undefined,
      },
    );
    const req = httpTesting.expectOne({
      url: '/api/auth/password/reset',
      method: 'POST',
    });
    req.flush(null);

    await expect(requestPasswordResetPromise).resolves.not.toThrow();
  });

  it('should reset', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const authService = TestBed.inject(AuthService);

    const resetPasswordPromise = firstValueFrom(
      authService.resetPassword('a-token', 'a-user-id', 'newPassword1!'),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: '/api/auth/password/reset/confirm',
      method: 'POST',
    });
    req.flush(null);

    await expect(resetPasswordPromise).resolves.not.toThrow();
  });

  it('should get user', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const authService = TestBed.inject(AuthService);

    const userPromise = firstValueFrom(authService.getUser());

    const req = httpTesting.expectOne({
      url: '/api/auth/user',
      method: 'GET',
    });
    req.flush({
      uuid: '772893c2-c78f-42d8-82a7-5d56a1837a28',
      email: 'test@test.com',
      subscribedFeedUuids: [],
      attributes: {},
    });

    const user = await userPromise;
    expect(ZUser.safeParse(user).success).toBe(true);
  });

  it('should update user attributes', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const authService = TestBed.inject(AuthService);

    const updateAttributesPromise = firstValueFrom(
      authService.updateUserAttributes({}),
      {
        defaultValue: undefined,
      },
    );

    const req = httpTesting.expectOne({
      url: '/api/auth/user/attributes',
      method: 'PUT',
    });
    req.flush(null);

    await expect(updateAttributesPromise).resolves.not.toThrow();
  });
});
