import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom, of } from 'rxjs';
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

  it('should get', fakeAsync(async () => {
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

    expect(ZUserCategory.safeParse(userCategory).success).toBeTrue();
  }));

  it('should query', fakeAsync(async () => {
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

    expect(objects.objects).toEqual(jasmine.any(Array));
  }));

  it('should query', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const objectsPromise = firstValueFrom(userCategoryService.queryAll());

    const reqs = httpTesting.match(
      r => r.method === 'POST' && /\/api\/usercategories\/query/.test(r.url),
    );
    for (const req of reqs) {
      req.flush({
        totalCount: 0,
        objects: [],
      });
    }

    const objects = await objectsPromise;
    expect(objects.objects).toEqual(jasmine.any(Array));
  }));

  it('should create', fakeAsync(async () => {
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

    expect(ZUserCategory.safeParse(userCategory).success).toBeTrue();
  }));

  it('should delete', fakeAsync(async () => {
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

    await expectAsync(deletePromise).toBeResolved();
  }));

  it('should apply', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const applyPromise = firstValueFrom(
      userCategoryService.apply({
        '123e4567-e89b-12d3-a456-426614174000': new Set([
          '123e4567-e89b-12d3-a456-426614174001',
        ]),
      }),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: '/api/usercategories/apply',
      method: 'PUT',
    });
    req.flush(null);

    await expectAsync(applyPromise).toBeResolved();
  }));

  it('should error JSON not object', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const p = firstValueFrom(userCategoryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' &&
        new RegExp(`/api/usercategory/${UUID}`).test(r.url),
    );
    req.flush([]);

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `uuid`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const userCategoryService = TestBed.inject(UserCategoryService);

    const userPromise = firstValueFrom(userCategoryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' &&
        new RegExp(`/api/usercategory/${UUID}`).test(r.url),
    );
    req.flush({
      uuid: '123e4567-e89b-12d3-a456-426614174000',
    });

    const user = await userPromise;

    expect(user.uuid).toEqual(jasmine.any(String));
  }));

  it('should `uuid` type error', fakeAsync(async () => {
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

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `text`', fakeAsync(async () => {
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

    await expectAsync(userPromise).toBeResolvedTo(
      jasmine.objectContaining({
        text: jasmine.any(String),
      }),
    );
  }));

  it('should `text` type error', fakeAsync(async () => {
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

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));
});
