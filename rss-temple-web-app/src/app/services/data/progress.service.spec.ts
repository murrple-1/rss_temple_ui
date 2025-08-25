import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom, of } from 'rxjs';
import { z } from 'zod';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>('HttpClient', ['get']),
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

  it('should check progress', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const progressService = TestBed.inject(ProgressService);

      httpClientSpy.get.and.returnValue(
        of({
          state: 'notstarted',
          totalCount: 10,
          finishedCount: 0,
        }),
      );

      let progress = await firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      expect(progress).toEqual(
        jasmine.objectContaining({
          state: jasmine.stringMatching(/^(?:notstarted|started|finished)$/),
          totalCount: jasmine.any(Number),
          finishedCount: jasmine.any(Number),
        }),
      );

      httpClientSpy.get.and.returnValue(
        of({
          state: 'started',
          totalCount: 10,
          finishedCount: 4,
        }),
      );

      progress = await firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      expect(progress).toEqual(
        jasmine.objectContaining({
          state: jasmine.stringMatching(/^(?:notstarted|started|finished)$/),
          totalCount: jasmine.any(Number),
          finishedCount: jasmine.any(Number),
        }),
      );

      httpClientSpy.get.and.returnValue(
        of({
          state: 'finished',
          totalCount: 10,
          finishedCount: 10,
        }),
      );

      progress = await firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      expect(progress).toEqual(
        jasmine.objectContaining({
          state: jasmine.stringMatching(/^(?:notstarted|started|finished)$/),
          totalCount: jasmine.any(Number),
          finishedCount: jasmine.any(Number),
        }),
      );
    });
  }));

  it('should fail when JSON is not object', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const progressService = TestBed.inject(ProgressService);

      httpClientSpy.get.and.returnValue(of([1]));

      const p = firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));

  it('should fail `state` missing', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const progressService = TestBed.inject(ProgressService);

      httpClientSpy.get.and.returnValue(
        of({
          totalCount: 10,
          finishedCount: 10,
        }),
      );

      const p = firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));

  it('should fail `state` type error', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const progressService = TestBed.inject(ProgressService);

      httpClientSpy.get.and.returnValue(
        of({
          state: 0,
          totalCount: 10,
          finishedCount: 10,
        }),
      );

      const p = firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));

  it('should fail `state` malformed', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const progressService = TestBed.inject(ProgressService);

      httpClientSpy.get.and.returnValue(
        of({
          state: 'badstring',
          totalCount: 10,
          finishedCount: 10,
        }),
      );

      const p = firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));

  it('should fail `totalCount` missing', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const progressService = TestBed.inject(ProgressService);

      httpClientSpy.get.and.returnValue(
        of({
          state: 'started',
          finishedCount: 4,
        }),
      );

      const p = firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));

  it('should fail `totalCount` type error', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const progressService = TestBed.inject(ProgressService);

      httpClientSpy.get.and.returnValue(
        of({
          state: 'started',
          totalCount: 'totalCount',
          finishedCount: 4,
        }),
      );

      const p = firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));

  it('should fail `finishedCount` missing', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const progressService = TestBed.inject(ProgressService);

      httpClientSpy.get.and.returnValue(
        of({
          state: 'started',
          totalCount: 10,
        }),
      );

      const p = firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));

  it('should fail `finishedCount` type error', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const progressService = TestBed.inject(ProgressService);

      httpClientSpy.get.and.returnValue(
        of({
          state: 'started',
          totalCount: 10,
          finishedCount: 'finishedCount',
        }),
      );

      const p = firstValueFrom(
        progressService.checkProgress('123e4567-e89b-12d3-a456-426614174000'),
      );

      await expectAsync(p).toBeRejected();
      await expectAsync(
        p.catch(reason => reason.constructor.name),
      ).toBeResolvedTo(z.ZodError.name);
    });
  }));
});
