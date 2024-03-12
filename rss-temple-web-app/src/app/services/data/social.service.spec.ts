import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { AuthStateService } from '@app/services/auth-state.service';
import { MockConfigService } from '@app/test/config.service.mock';

import { SocialService } from './social.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'post',
    'delete',
  ]);

  const authStateService = new AuthStateService();
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const socialService = new SocialService(
    httpClientSpy,
    authStateService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    authStateService,
    mockConfigService,

    socialService,
  };
}

describe('SocialService', () => {
  beforeEach(() => {
    AuthStateService.removeCSRFTokenFromStorage();
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
