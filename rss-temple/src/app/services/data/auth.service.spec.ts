import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { ZUser } from '@app/models/user';
import { AuthTokenService } from '@app/services/auth-token.service';
import { MockConfigService } from '@app/test/config.service.mock';

import { AuthService } from './auth.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
  ]);
  const authTokenService = new AuthTokenService();
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const authService = new AuthService(
    httpClientSpy,
    authTokenService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    authTokenService,
    mockConfigService,

    authService,
  };
}

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

  it('should login', fakeAsync(async () => {
    const { httpClientSpy, authService } = setup();
    httpClientSpy.post.and.returnValue(
      of({
        key: '',
      }),
    );

    const response = await authService
      .login('test@test.com', 'password')
      .toPromise();
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
    const { httpClientSpy, authService } = setup();
    httpClientSpy.post.and.returnValue(of<void>());

    await authService
      .logout({
        authToken: 'sessionId',
      })
      .toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/auth\/logout$/),
      undefined,
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          'Authorization': jasmine.any(String),
        }),
      }),
    );
  }));

  it('should request', fakeAsync(async () => {
    const { httpClientSpy, authService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await expectAsync(
      authService.requestPasswordReset('test@example.com').toPromise(),
    ).toBeResolved();
  }));

  it('should reset', fakeAsync(async () => {
    const { httpClientSpy, authService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await expectAsync(
      authService
        .resetPassword('a-token', 'a-user-id', 'newPassword1!')
        .toPromise(),
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

    const user = await authService.getUser().toPromise();
    expect(ZUser.safeParse(user).success).toBeTrue();
  }));

  it('should update user attributes', fakeAsync(async () => {
    const { httpClientSpy, authService } = setup();

    httpClientSpy.put.and.returnValue(of());

    await expectAsync(
      authService.updateUserAttributes({}).toPromise(),
    ).toBeResolved();
  }));
});
