import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { MockConfigService } from '@app/test/config.service.mock';

import { CaptchaService } from './captcha.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'post',
  ]);

  const mockConfigService = new MockConfigService({
    apiHost: '',
  });
  const captchaService = new CaptchaService(httpClientSpy, mockConfigService);

  return {
    httpClientSpy,
    mockConfigService,

    captchaService,
  };
}

describe('CaptchaService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

  it('should get new key', fakeAsync(async () => {
    const { httpClientSpy, captchaService } = setup();

    httpClientSpy.post.and.returnValue(of('newkey'));

    await captchaService.getKey().toPromise();
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
  }));

  // TODO more tests
});
