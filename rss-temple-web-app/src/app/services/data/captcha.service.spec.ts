import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

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

  it('should get new key', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const captchaService = TestBed.inject(CaptchaService);

    const keyPromise = firstValueFrom(captchaService.getKey());

    const req = httpTesting.expectOne({
      url: '/api/captcha',
      method: 'POST',
    });
    req.flush('newkey');

    await expect(keyPromise).resolves.not.toThrow();
  });

  // TODO more tests
});
