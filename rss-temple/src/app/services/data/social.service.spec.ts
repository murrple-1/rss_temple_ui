import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { AuthTokenService } from '@app/services/auth-token.service';

import { SocialService } from './social.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'post',
    'delete',
  ]);

  const authTokenService = new AuthTokenService();

  const socialService = new SocialService(httpClientSpy, authTokenService);

  return {
    httpClientSpy,

    socialService,
  };
}

describe('SocialService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

  it('should create "google" login', fakeAsync(async () => {
    const { httpClientSpy, socialService } = setup();
    // TODO implement
  }));

  it('should create "facebook" login', fakeAsync(async () => {
    const { httpClientSpy, socialService } = setup();
    // TODO implement
  }));

  it('should create "google" session', fakeAsync(async () => {
    const { httpClientSpy, socialService } = setup();
    // TODO implement
  }));

  it('should create "google" session', fakeAsync(async () => {
    const { httpClientSpy, socialService } = setup();
    // TODO implement
  }));
});
