import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { AuthTokenService } from '@app/services/auth-token.service';

import { LoginService } from './login.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'post',
    'delete',
  ]);
  const authTokenService = new AuthTokenService();

  const loginService = new LoginService(httpClientSpy, authTokenService);

  return {
    httpClientSpy,
    authTokenService,

    loginService,
  };
}

describe('LoginService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

  it('should create a "my" login', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();

    httpClientSpy.post.and.returnValue(of<void>());

    await loginService.createMyLogin('test@test.com', 'password').toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/login\/my$/),
      jasmine.objectContaining({
        email: jasmine.any(String),
        password: jasmine.any(String),
      }),
    );
  }));

  it('should create "google" login', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    // TODO implement
  }));

  it('should create "facebook" login', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    // TODO implement
  }));

  it('should create "my" session', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    httpClientSpy.post.and.returnValue(
      of({
        expiry: '2023-07-06T13:12:57.960860Z',
        token:
          '40a915540d20921f4a565d5ea0f8b5e49ad0d34c87365c342c0ba2402d8f0c69',
      }),
    );

    const response = await loginService
      .getMyLoginSession('test@test.com', 'password')
      .toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/login$/),
      undefined,
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          Authorization: jasmine.any(String),
        }),
      }),
    );
    expect(response).toEqual(
      jasmine.objectContaining({
        expiry: jasmine.any(Date),
        token: jasmine.any(String),
      }),
    );
  }));

  it('should create "google" session', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    // TODO implement
  }));

  it('should create "google" session', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    // TODO implement
  }));

  it('should delete session tokens', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    httpClientSpy.post.and.returnValue(of<void>());

    await loginService
      .deleteSessionToken({
        authToken: 'sessionId',
      })
      .toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/logout$/),
      undefined,
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          'Authorization': jasmine.any(String),
        }),
      }),
    );
  }));
});
