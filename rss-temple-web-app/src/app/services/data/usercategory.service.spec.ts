import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { z } from 'zod';

import { ZUserCategory } from '@app/models/usercategory';
import { MockConfigService } from '@app/test/config.service.mock';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { UserCategoryService } from './usercategory.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
    'delete',
  ]);
  const mockCookieService = new MockCookieService({});
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const userCategoryService = new UserCategoryService(
    httpClientSpy,
    mockCookieService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    mockCookieService,
    mockConfigService,

    userCategoryService,
  };
}

describe('UserCategoryService', () => {
  it('should get', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.get.and.returnValue(of({}));

    const userCategory = await firstValueFrom(
      userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );
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

    const objects = await firstValueFrom(userCategoryService.query());
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

    const objects = await firstValueFrom(userCategoryService.queryAll());
    expect(objects.objects).toEqual(jasmine.any(Array));
  }));

  it('should create', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.post.and.returnValue(of({}));

    const userCategory = await firstValueFrom(
      userCategoryService.create({
        text: 'Category Name',
      }),
    );
    expect(ZUserCategory.safeParse(userCategory).success).toBeTrue();
  }));

  it('should delete', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.delete.and.returnValue(of());

    await expectAsync(
      firstValueFrom(
        userCategoryService.delete('123e4567-e89b-12d3-a456-426614174000'),
        { defaultValue: undefined },
      ),
    ).toBeResolved();
  }));

  it('should apply', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.put.and.returnValue(of());

    await expectAsync(
      firstValueFrom(
        userCategoryService.apply({
          '123e4567-e89b-12d3-a456-426614174000': new Set([
            '123e4567-e89b-12d3-a456-426614174001',
          ]),
        }),
        { defaultValue: undefined },
      ),
    ).toBeResolved();
  }));

  it('should error JSON not object', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.get.and.returnValue(of([]));

    await expectAsync(
      firstValueFrom(
        userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `uuid`', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: '123e4567-e89b-12d3-a456-426614174000',
      }),
    );

    const user = await firstValueFrom(
      userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );
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
      firstValueFrom(
        userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `text`', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        text: 'Category Name',
      }),
    );

    const user = await firstValueFrom(
      userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );
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
      firstValueFrom(
        userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));
});
