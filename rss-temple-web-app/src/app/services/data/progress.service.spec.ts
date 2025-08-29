import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';
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

const UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('ProgressService', () => {
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

  it('should check progress', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const progressService = TestBed.inject(ProgressService);

    let progressPromise = firstValueFrom(progressService.checkProgress(UUID));

    let req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush({
      state: 'notstarted',
      totalCount: 10,
      finishedCount: 0,
    });

    await expectAsync(progressPromise).toBeResolvedTo(
      jasmine.objectContaining({
        state: jasmine.stringMatching(/^(?:notstarted|started|finished)$/),
        totalCount: jasmine.any(Number),
        finishedCount: jasmine.any(Number),
      }),
    );

    progressPromise = firstValueFrom(progressService.checkProgress(UUID));

    req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush({
      state: 'started',
      totalCount: 10,
      finishedCount: 4,
    });

    await expectAsync(progressPromise).toBeResolvedTo(
      jasmine.objectContaining({
        state: jasmine.stringMatching(/^(?:notstarted|started|finished)$/),
        totalCount: jasmine.any(Number),
        finishedCount: jasmine.any(Number),
      }),
    );

    progressPromise = firstValueFrom(progressService.checkProgress(UUID));

    req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush({
      state: 'finished',
      totalCount: 10,
      finishedCount: 10,
    });

    await expectAsync(progressPromise).toBeResolvedTo(
      jasmine.objectContaining({
        state: jasmine.stringMatching(/^(?:notstarted|started|finished)$/),
        totalCount: jasmine.any(Number),
        finishedCount: jasmine.any(Number),
      }),
    );
  }));

  it('should fail when JSON is not object', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const progressService = TestBed.inject(ProgressService);

    const p = firstValueFrom(progressService.checkProgress(UUID));

    const req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush([1]);

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should fail `state` missing', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const progressService = TestBed.inject(ProgressService);

    const p = firstValueFrom(progressService.checkProgress(UUID));

    const req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush({
      totalCount: 10,
      finishedCount: 10,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should fail `state` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const progressService = TestBed.inject(ProgressService);

    const p = firstValueFrom(progressService.checkProgress(UUID));

    const req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush({
      state: 0,
      totalCount: 10,
      finishedCount: 10,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should fail `state` malformed', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const progressService = TestBed.inject(ProgressService);

    const p = firstValueFrom(progressService.checkProgress(UUID));

    const req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush({
      state: 'badstring',
      totalCount: 10,
      finishedCount: 10,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should fail `totalCount` missing', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const progressService = TestBed.inject(ProgressService);

    const p = firstValueFrom(progressService.checkProgress(UUID));

    const req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush({
      state: 'started',
      finishedCount: 4,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should fail `totalCount` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const progressService = TestBed.inject(ProgressService);

    const p = firstValueFrom(progressService.checkProgress(UUID));

    const req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush({
      state: 'started',
      totalCount: 'totalCount',
      finishedCount: 4,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should fail `finishedCount` missing', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const progressService = TestBed.inject(ProgressService);

    const p = firstValueFrom(progressService.checkProgress(UUID));

    const req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush({
      state: 'started',
      totalCount: 10,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should fail `finishedCount` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const progressService = TestBed.inject(ProgressService);

    const p = firstValueFrom(progressService.checkProgress(UUID));

    const req = httpTesting.expectOne({
      url: `/api/feed/subscribe/progress/${UUID}`,
      method: 'GET',
    });
    req.flush({
      state: 'started',
      totalCount: 10,
      finishedCount: 'finishedCount',
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));
});
