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

  it('should register', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();

    httpClientSpy.post.and.returnValue(of<void>());

    await loginService.register('test@test.com', 'password').toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/registration$/),
      jasmine.objectContaining({
        email: jasmine.any(String),
        password1: jasmine.any(String),
        password2: jasmine.any(String),
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

  it('should login', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    httpClientSpy.post.and.returnValue(
      of({
        key: '',
      }),
    );

    const response = await loginService
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

  it('should create "google" session', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    // TODO implement
  }));

  it('should create "google" session', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    // TODO implement
  }));

  it('should logout', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    httpClientSpy.post.and.returnValue(of<void>());

    await loginService
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
});
