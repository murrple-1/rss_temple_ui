import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ZUserCategory } from '@app/models/usercategory';
import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { UserCategoryService } from './usercategory.service';

const UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('UserCategoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
          },
        },
        {
          provide: MOCK_COOKIE_SERVICE_CONFIG,
          useValue: {},
        },
        {
          provide: CookieService,
          useClass: MockCookieService,
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    });
  });

  afterEach(() => {
    const httpTesting = TestBed.inject(HttpTestingController);
    httpTesting.verify();
  });

  it('should get', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const userCategoryPromise = firstValueFrom(userCategoryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' &&
        new RegExp(`/api/usercategory/${UUID}`).test(r.url),
    );
    req.flush({});

    const userCategory = await userCategoryPromise;

    expect(ZUserCategory.safeParse(userCategory).success).toBe(true);
  });

  it('should query', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const objectsPromise = firstValueFrom(userCategoryService.query());

    const req = httpTesting.expectOne(
      r => r.method === 'POST' && /\/api\/usercategories\/query/.test(r.url),
    );
    req.flush({
      totalCount: 0,
      objects: [],
    });

    const objects = await objectsPromise;

    expect(objects.objects).toEqual(expect.any(Array));
  });

  it('should query', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const objectsPromise = firstValueFrom(userCategoryService.queryAll());

    const reqs = httpTesting.match(
      r => r.method === 'POST' && /\/api\/usercategories\/query/.test(r.url),
    );
    expect(reqs.length).toBe(1);
    for (const req of reqs) {
      req.flush({
        totalCount: 0,
        objects: [],
      });
    }

    const objects = await objectsPromise;
    expect(objects.objects).toEqual(expect.any(Array));
  });

  it('should create', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const userCategoryPromise = firstValueFrom(
      userCategoryService.create({
        text: 'Category Name',
      }),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'POST' && /\/api\/usercategory/.test(r.url),
    );
    req.flush({});

    const userCategory = await userCategoryPromise;

    expect(ZUserCategory.safeParse(userCategory).success).toBe(true);
  });

  it('should delete', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const deletePromise = firstValueFrom(userCategoryService.delete(UUID), {
      defaultValue: undefined,
    });

    const req = httpTesting.expectOne(
      r =>
        r.method === 'DELETE' &&
        new RegExp(`/api/usercategory/${UUID}`).test(r.url),
    );
    req.flush(null);

    await expect(deletePromise).resolves.not.toThrow();
  });

  it('should apply', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const applyPromise = firstValueFrom(
      userCategoryService.apply({
        '123e4567-e89b-12d3-a456-426614174020': new Set([
          '123e4567-e89b-12d3-a456-426614174021',
        ]),
      }),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: '/api/usercategories/apply',
      method: 'PUT',
    });
    req.flush(null);

    await expect(applyPromise).resolves.not.toThrow();
  });

  it('should error JSON not object', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const p = firstValueFrom(userCategoryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' &&
        new RegExp(`/api/usercategory/${UUID}`).test(r.url),
    );
    req.flush([]);

    await expect(p).rejects.toThrow();
    await expect(p.catch(reason => reason.constructor.name)).resolves.toEqual(
      z.ZodError.name,
    );
  });

  it('should `uuid`', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const userPromise = firstValueFrom(userCategoryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' &&
        new RegExp(`/api/usercategory/${UUID}`).test(r.url),
    );
    req.flush({
      uuid: UUID,
    });

    const user = await userPromise;

    expect(user.uuid).toEqual(expect.any(String));
  });

  it('should `uuid` type error', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const p = firstValueFrom(userCategoryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' &&
        new RegExp(`/api/usercategory/${UUID}`).test(r.url),
    );
    req.flush({
      uuid: 0,
    });

    await expect(p).rejects.toThrow();
    await expect(p.catch(reason => reason.constructor.name)).resolves.toEqual(
      z.ZodError.name,
    );
  });

  it('should `text`', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const userPromise = firstValueFrom(userCategoryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' &&
        new RegExp(`/api/usercategory/${UUID}`).test(r.url),
    );
    req.flush({
      text: 'Category Name',
    });

    await expect(userPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.any(String),
      }),
    );
  });

  it('should `text` type error', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const p = firstValueFrom(userCategoryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' &&
        new RegExp(`/api/usercategory/${UUID}`).test(r.url),
    );
    req.flush({
      text: 0,
    });

    await expect(p).rejects.toThrow();
    await expect(p.catch(reason => reason.constructor.name)).resolves.toEqual(
      z.ZodError.name,
    );
  });
});
