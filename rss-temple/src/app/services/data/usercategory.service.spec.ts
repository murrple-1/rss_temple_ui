import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { z } from 'zod';

import { ZUserCategory } from '@app/models/usercategory';
import { AuthTokenService } from '@app/services/auth-token.service';
import { MockConfigService } from '@app/test/config.service.mock';

import { UserCategoryService } from './usercategory.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
    'delete',
  ]);
  const authTokenService = new AuthTokenService();
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const userCategoryService = new UserCategoryService(
    httpClientSpy,
    authTokenService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    authTokenService,
    mockConfigService,

    userCategoryService,
  };
}

describe('UserCategoryService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

  it('should get', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.get.and.returnValue(of({}));

    const userCategory = await userCategoryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();
    expect(ZUserCategory.safeParse(userCategory).success).toBeTrue();
  }));

  it('should query', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.post.and.returnValue(
      of({
        totalCount: 0,
        objects: [],
      }),
    );

    const objects = await userCategoryService.query().toPromise();
    expect(objects.objects).toEqual(jasmine.any(Array));
  }));

  it('should query', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.post.and.returnValue(
      of({
        totalCount: 0,
        objects: [],
      }),
    );

    const objects = await userCategoryService.queryAll().toPromise();
    expect(objects.objects).toEqual(jasmine.any(Array));
  }));

  it('should create', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.post.and.returnValue(of({}));

    const userCategory = await userCategoryService
      .create({
        text: 'Category Name',
      })
      .toPromise();
    expect(ZUserCategory.safeParse(userCategory).success).toBeTrue();
  }));

  it('should delete', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.delete.and.returnValue(of());

    await expectAsync(
      userCategoryService
        .delete('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeResolved();
  }));

  it('should apply', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.put.and.returnValue(of());

    await expectAsync(
      userCategoryService
        .apply({
          '123e4567-e89b-12d3-a456-426614174000': new Set([
            '123e4567-e89b-12d3-a456-426614174001',
          ]),
        })
        .toPromise(),
    ).toBeResolved();
  }));

  it('should error JSON not object', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.get.and.returnValue(of([]));

    await expectAsync(
      userCategoryService
        .get('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `uuid`', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: '123e4567-e89b-12d3-a456-426614174000',
      }),
    );

    const user = await userCategoryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();
    expect(user.uuid).toEqual(jasmine.any(String));
  }));

  it('should `uuid` type error', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: 0,
      }),
    );

    await expectAsync(
      userCategoryService
        .get('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `text`', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        text: 'Category Name',
      }),
    );

    const user = await userCategoryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();
    expect(user.text).toEqual(jasmine.any(String));
  }));

  it('should `text` type error', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        text: 0,
      }),
    );

    await expectAsync(
      userCategoryService
        .get('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));
});
