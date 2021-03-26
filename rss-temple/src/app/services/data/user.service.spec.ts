import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { User } from '@app/models';
import { SessionService } from '@app/services/session.service';

import { UserService } from './user.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
  ]);
  const sessionService = new SessionService();

  const userService = new UserService(httpClientSpy, sessionService);

  return {
    httpClientSpy,
    sessionService,

    userService,
  };
}

describe('UserService', () => {
  beforeEach(() => {
    localStorage.removeItem('session-service:sessionToken');
  });

  it('should get', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.get.and.returnValue(of({}));

    const user = await userService.get().toPromise();
    expect(user).toBeInstanceOf(User);
  }));

  it('should update', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();

    httpClientSpy.put.and.returnValue(of());

    await expectAsync(userService.update({}).toPromise()).toBeResolved();
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
      Error,
      /must be object/,
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
      Error,
      /uuid.*?must be string/,
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
      Error,
      /email.*?must be string/,
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
      Error,
      /hasGoogleLogin.*?must be boolean/,
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
      Error,
      /hasFacebookLogin.*?must be boolean/,
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
      Error,
      /subscribedFeedUuids.*?must be array/,
    );

    httpClientSpy.get.and.returnValue(
      of({
        subscribedFeedUuids: [0],
      }),
    );

    await expectAsync(userService.get().toPromise()).toBeRejectedWithError(
      Error,
      /subscribedFeedUuids.*?element.*?must be string/,
    );
  }));
});
