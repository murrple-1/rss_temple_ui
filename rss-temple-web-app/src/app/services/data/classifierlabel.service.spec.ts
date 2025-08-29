import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { ClassifierLabelService } from './classifierlabel.service';

describe('ClassifierLabelService', () => {
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
        ClassifierLabelService,
      ],
    });
  });

  afterEach(() => {
    const httpTesting = TestBed.inject(HttpTestingController);
    httpTesting.verify();
  });

  it('should getAll without feed entry', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const classifierLabelService = TestBed.inject(ClassifierLabelService);

    const exampleClassifierLabels = [
      {
        uuid: '9dc9393a-6410-4848-9202-7ce4fd8cea61',
        text: 'Label 1',
      },
      {
        uuid: '2eea97c8-f5da-4bb2-ab98-519b6c1f1145',
        text: 'Label 2',
      },
    ];

    const classifierLabelsPromise = firstValueFrom(
      classifierLabelService.getAll(undefined),
    );

    const req = httpTesting.expectOne({
      url: '/api/classifierlabels',
      method: 'GET',
    });
    req.flush(exampleClassifierLabels);

    await expectAsync(classifierLabelsPromise).toBeResolvedTo(
      exampleClassifierLabels,
    );
  }));

  // TODO more tests
});
