import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { MockConfigService } from '@app/test/config.service.mock';

import { RegistrationService } from './registration.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'post',
    'delete',
  ]);

  const mockConfigService = new MockConfigService({
    apiHost: '',
  });
  const registrationService = new RegistrationService(
    httpClientSpy,
    mockConfigService,
  );

  return {
    httpClientSpy,
    mockConfigService,

    registrationService,
  };
}

describe('RegistrationService', () => {
  it('should register', fakeAsync(async () => {
    const { httpClientSpy, registrationService } = setup();

    httpClientSpy.post.and.returnValue(of<void>());

    await firstValueFrom(
      registrationService.register(
        'test@test.com',
        'password',
        'captchaKey',
        'captchaSecretPhrase',
      ),
      { defaultValue: undefined },
    );
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/api\/registration$/),
      jasmine.objectContaining({
        email: jasmine.any(String),
        password: jasmine.any(String),
      }),
    );
  }));
});
