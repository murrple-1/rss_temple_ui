import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { MockConfigService } from '@app/test/config.service.mock';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { SocialService } from './social.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'post',
    'delete',
  ]);

  const mockCookieService = new MockCookieService({});
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const socialService = new SocialService(
    httpClientSpy,
    mockCookieService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    mockCookieService,
    mockConfigService,

    socialService,
  };
}

describe('SocialService', () => {
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
