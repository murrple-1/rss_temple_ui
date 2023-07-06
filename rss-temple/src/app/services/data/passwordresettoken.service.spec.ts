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

describe('PasswordResetTokenService', () => {
  it('should request', fakeAsync(async () => {
    const { httpClientSpy, passwordResetTokenService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await expectAsync(
      passwordResetTokenService.request('test@example.com').toPromise(),
    ).toBeResolved();
  }));

  it('should reset', fakeAsync(async () => {
    const { httpClientSpy, passwordResetTokenService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await expectAsync(
      passwordResetTokenService
        .reset('a-token', 'a-user-id', 'newPassword1!')
        .toPromise(),
    ).toBeResolved();
  }));
});
