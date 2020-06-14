import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { PasswordResetTokenService } from './passwordresettoken.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
  ]);

  const passwordResetTokenService = new PasswordResetTokenService(
    httpClientSpy,
  );

  return {
    httpClientSpy,

    passwordResetTokenService,
  };
}

describe('opml.service', () => {
  it('should request', fakeAsync(async () => {
    const { httpClientSpy, passwordResetTokenService } = setup();

    httpClientSpy.post.and.returnValue(of());

    expectAsync(
      passwordResetTokenService.request('test@example.com').toPromise(),
    ).toBeResolved();
  }));

  it('should reset', fakeAsync(async () => {
    const { httpClientSpy, passwordResetTokenService } = setup();

    httpClientSpy.post.and.returnValue(of());

    expectAsync(
      passwordResetTokenService
        .reset({
          token: 'a-token',
          password: 'newPassword1!',
        })
        .toPromise(),
    ).toBeResolved();
  }));
});
