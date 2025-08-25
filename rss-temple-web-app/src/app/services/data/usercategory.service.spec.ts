import { HttpClient } from '@angular/common/http';
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

describe('UserCategoryService', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>('HttpClient', [
            'get',
            'post',
            'put',
            'delete',
          ]),
        },
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

  it('should get', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);

      httpClientSpy.get.and.returnValue(of({}));

      const userCategory = await firstValueFrom(
        userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
      );
      expect(ZUserCategory.safeParse(userCategory).success).toBeTrue();
    });
  }));

  it('should query', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);

      httpClientSpy.post.and.returnValue(
        of({
          totalCount: 0,
          objects: [],
        }),
      );

      const objects = await firstValueFrom(userCategoryService.query());
      expect(objects.objects).toEqual(jasmine.any(Array));
    });
  }));

  it('should query', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);

      httpClientSpy.post.and.returnValue(
        of({
          totalCount: 0,
          objects: [],
        }),
      );

      const objects = await firstValueFrom(userCategoryService.queryAll());
      expect(objects.objects).toEqual(jasmine.any(Array));
    });
  }));

  it('should create', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);

      httpClientSpy.post.and.returnValue(of({}));

      const userCategory = await firstValueFrom(
        userCategoryService.create({
          text: 'Category Name',
        }),
      );
      expect(ZUserCategory.safeParse(userCategory).success).toBeTrue();
    });
  }));

  it('should delete', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);

      httpClientSpy.delete.and.returnValue(of());

      await expectAsync(
        firstValueFrom(
          userCategoryService.delete('123e4567-e89b-12d3-a456-426614174000'),
          { defaultValue: undefined },
        ),
      ).toBeResolved();
    });
  }));

  it('should apply', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);

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
    });
  }));

  it('should error JSON not object', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);
      httpClientSpy.get.and.returnValue(of([]));

      const p = firstValueFrom(
        userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));

  it('should `uuid`', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);
      httpClientSpy.get.and.returnValue(
        of({
          uuid: '123e4567-e89b-12d3-a456-426614174000',
        }),
      );

      const user = await firstValueFrom(
        userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
      );
      expect(user.uuid).toEqual(jasmine.any(String));
    });
  }));

  it('should `uuid` type error', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);
      httpClientSpy.get.and.returnValue(
        of({
          uuid: 0,
        }),
      );

      const p = firstValueFrom(
        userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));

  it('should `text`', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);

      httpClientSpy.get.and.returnValue(
        of({
          text: 'Category Name',
        }),
      );

      const user = await firstValueFrom(
        userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
      );
      expect(user.text).toEqual(jasmine.any(String));
    });
  }));

  it('should `text` type error', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const userCategoryService = TestBed.inject(UserCategoryService);

      httpClientSpy.get.and.returnValue(
        of({
          text: 0,
        }),
      );

      const p = firstValueFrom(
        userCategoryService.get('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));
});
