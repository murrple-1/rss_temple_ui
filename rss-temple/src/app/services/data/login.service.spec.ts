import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { APISessionService } from '@app/services/api-session.service';

import { LoginService } from './login.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'post',
    'delete',
  ]);
  const apiSessionService = new APISessionService();

  const loginService = new LoginService(httpClientSpy, apiSessionService);

  return {
    httpClientSpy,
    apiSessionService,

    loginService,
  };
}

describe('LoginService', () => {
  beforeEach(() => {
    localStorage.removeItem('api-session-service:sessionId');
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
    httpClientSpy.post.and.returnValue(of<void>());

    await loginService
      .createGoogleLogin('test@test.com', 'password', 'atoken')
      .toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/login\/google$/),
      jasmine.objectContaining({
        email: jasmine.any(String),
        password: jasmine.any(String),
        token: jasmine.any(String),
      }),
    );
  }));

  it('should create "facebook" login', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    httpClientSpy.post.and.returnValue(of<void>());

    await loginService
      .createFacebookLogin('test@test.com', 'password', 'atoken')
      .toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/login\/facebook$/),
      jasmine.objectContaining({
        email: jasmine.any(String),
        password: jasmine.any(String),
        token: jasmine.any(String),
      }),
    );
  }));

  it('should create "my" session', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    httpClientSpy.post.and.returnValue(of('sessiontoken'));

    const response = await loginService
      .getMyLoginSession('test@test.com', 'password')
      .toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/login\/my\/session$/),
      jasmine.objectContaining({
        email: jasmine.any(String),
        password: jasmine.any(String),
      }),
      jasmine.any(Object),
    );
    expect(response).toEqual(jasmine.any(String));
  }));

  it('should create "google" session', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    httpClientSpy.post.and.returnValue(of('sessiontoken'));

    const user = {
      getAuthResponse: () => ({
        id_token: 'id_token',
      }),
    } as gapi.auth2.GoogleUser;
    const response = await loginService.getGoogleLoginSession(user).toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/login\/google\/session$/),
      jasmine.objectContaining({
        token: jasmine.any(String),
      }),
      jasmine.any(Object),
    );
    expect(response).toEqual(jasmine.any(String));
  }));

  it('should create "google" session', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    httpClientSpy.post.and.returnValue(of('sessiontoken'));

    const user = {
      accessToken: 'accessToken',
    } as facebook.AuthResponse;
    const response = await loginService
      .getFacebookLoginSession(user)
      .toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/login\/facebook\/session$/),
      jasmine.objectContaining({
        token: jasmine.any(String),
      }),
      jasmine.any(Object),
    );
    expect(response).toEqual(jasmine.any(String));
  }));

  it('should delete session tokens', fakeAsync(async () => {
    const { httpClientSpy, loginService } = setup();
    httpClientSpy.delete.and.returnValue(of<void>());

    await loginService
      .deleteSessionToken({
        apiSessionId: 'sessionId',
      })
      .toPromise();
    expect(httpClientSpy.delete).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.delete).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/session$/),
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          'X-Session-ID': jasmine.any(String),
        }),
      }),
    );
  }));
});
