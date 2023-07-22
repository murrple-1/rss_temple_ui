import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { RegistrationService } from './registration.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'post',
    'delete',
  ]);

  const registrationService = new RegistrationService(httpClientSpy);

  return {
    httpClientSpy,

    registrationService,
  };
}

describe('RegistrationService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

  it('should register', fakeAsync(async () => {
    const { httpClientSpy, registrationService } = setup();

    httpClientSpy.post.and.returnValue(of<void>());

    await registrationService.register('test@test.com', 'password').toPromise();
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
});
