import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom, of } from 'rxjs';

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
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>('HttpClient', [
            'get',
            'post',
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

  it('should getAll without feed entry', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
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

      httpClientSpy.get.and.returnValue(of(exampleClassifierLabels));

      const classifierLabels = await firstValueFrom(
        classifierLabelService.getAll(undefined),
      );

      expect(classifierLabels).toEqual(exampleClassifierLabels);
    });
  }));

  // TODO more tests
});
