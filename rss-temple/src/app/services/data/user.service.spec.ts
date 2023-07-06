import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { z } from 'zod';

import { AuthTokenService } from '@app/services/auth-token.service';

import { UserService } from './user.service';
import { ZUser } from '@app/models/user';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
  ]);
  const authTokenService = new AuthTokenService();

  const userService = new UserService(httpClientSpy, authTokenService);

  return {
    httpClientSpy,
    authTokenService,

    userService,
  };
}

describe('UserService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

  it('should get', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(of({}));

    const user = await userService.get().toPromise();
    expect(ZUser.safeParse(user).success).toBeTrue();
  }));

  it('should update', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();
    // TODO implement
  }));

  it('should verify', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await expectAsync(userService.verify('a-token').toPromise()).toBeResolved();
  }));

  it('should error JSON not object', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(of([]));

    await expectAsync(userService.get().toPromise()).toBeRejectedWithError(
      z.ZodError,
    );
  }));

  it('should `uuid`', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: '123e4567-e89b-12d3-a456-426614174000',
      }),
    );

    const user = await userService.get().toPromise();
    expect(user.uuid).toEqual(jasmine.any(String));
  }));

  it('should `uuid` type error', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: 0,
      }),
    );

    await expectAsync(userService.get().toPromise()).toBeRejectedWithError(
      z.ZodError,
    );
  }));

  it('should `email`', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        email: 'test@example.com',
      }),
    );

    const user = await userService.get().toPromise();
    expect(user.email).toEqual(jasmine.any(String));
  }));

  it('should `email` type error', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        email: 0,
      }),
    );

    await expectAsync(userService.get().toPromise()).toBeRejectedWithError(
      z.ZodError,
    );
  }));

  it('should `hasGoogleLogin`', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        hasGoogleLogin: true,
      }),
    );

    const user = await userService.get().toPromise();
    expect(user.hasGoogleLogin).toEqual(jasmine.any(Boolean));
  }));

  it('should `hasGoogleLogin` type error', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        hasGoogleLogin: 0,
      }),
    );

    await expectAsync(userService.get().toPromise()).toBeRejectedWithError(
      z.ZodError,
    );
  }));

  it('should `hasFacebookLogin`', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        hasFacebookLogin: true,
      }),
    );

    const user = await userService.get().toPromise();
    expect(user.hasFacebookLogin).toEqual(jasmine.any(Boolean));
  }));

  it('should `hasFacebookLogin` type error', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        hasFacebookLogin: 0,
      }),
    );

    await expectAsync(userService.get().toPromise()).toBeRejectedWithError(
      z.ZodError,
    );
  }));

  it('should `subscribedFeedUuids`', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        subscribedFeedUuids: [],
      }),
    );

    let user = await userService.get().toPromise();
    expect(user.subscribedFeedUuids).toEqual(jasmine.any(Array));

    httpClientSpy.get.and.returnValue(
      of({
        subscribedFeedUuids: ['123e4567-e89b-12d3-a456-426614174000'],
      }),
    );

    user = await userService.get().toPromise();
    expect(user.subscribedFeedUuids).toEqual(
      jasmine.arrayContaining([jasmine.any(String)]),
    );
  }));

  it('should `subscribedFeedUuids` type error', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        subscribedFeedUuids: 0,
      }),
    );

    await expectAsync(userService.get().toPromise()).toBeRejectedWithError(
      z.ZodError,
    );

    httpClientSpy.get.and.returnValue(
      of({
        subscribedFeedUuids: [0],
      }),
    );

    await expectAsync(userService.get().toPromise()).toBeRejectedWithError(
      z.ZodError,
    );
  }));
});
