import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ZUser } from '@app/models/user';
import { MockConfigService } from '@app/test/config.service.mock';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { AuthService } from './auth.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
  ]);
  const mockCookieService = new MockCookieService({});
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const authService = new AuthService(
    httpClientSpy,
    mockCookieService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    mockCookieService,
    mockConfigService,

    authService,
  };
}

describe('AuthService', () => {
  it('should login', fakeAsync(async () => {
    const { httpClientSpy, authService } = setup();
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
  }));

  it('should logout', fakeAsync(async () => {
    const { httpClientSpy, mockCookieService, authService } = setup();
    httpClientSpy.post.and.returnValue(of());
    mockCookieService._cookieConfig = {
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
  }));

  it('should request', fakeAsync(async () => {
    const { httpClientSpy, authService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await expectAsync(
      firstValueFrom(authService.requestPasswordReset('test@example.com'), {
        defaultValue: undefined,
      }),
    ).toBeResolved();
  }));

  it('should reset', fakeAsync(async () => {
    const { httpClientSpy, authService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await expectAsync(
      firstValueFrom(
        authService.resetPassword('a-token', 'a-user-id', 'newPassword1!'),
        { defaultValue: undefined },
      ),
    ).toBeResolved();
  }));

  it('should get user', fakeAsync(async () => {
    const { httpClientSpy, authService } = setup();

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
  }));

  it('should update user attributes', fakeAsync(async () => {
    const { httpClientSpy, authService } = setup();

    httpClientSpy.put.and.returnValue(of());

    await expectAsync(
      firstValueFrom(authService.updateUserAttributes({}), {
        defaultValue: undefined,
      }),
    ).toBeResolved();
  }));
});
