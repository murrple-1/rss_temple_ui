import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { CaptchaService } from './captcha.service';

describe('CaptchaService', () => {
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

  it('should get new key', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const captchaService = TestBed.inject(CaptchaService);

    const keyPromise = firstValueFrom(captchaService.getKey());

    const req = httpTesting.expectOne({
      url: '/api/captcha',
      method: 'POST',
    });
    req.flush('newkey');

    await expectAsync(keyPromise).toBeResolved();
  }));

  // TODO more tests
});
