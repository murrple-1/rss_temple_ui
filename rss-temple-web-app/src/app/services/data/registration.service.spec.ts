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

import { RegistrationService } from './registration.service';

describe('RegistrationService', () => {
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

  it('should register', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const registrationService = TestBed.inject(RegistrationService);

    const registerPromise = firstValueFrom(
      registrationService.register(
        'test@test.com',
        'password',
        'captchaKey',
        'captchaSecretPhrase',
      ),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: '/api/registration',
      method: 'POST',
    });
    expect(req.request.body).toEqual(
      expect.objectContaining({
        email: expect.any(String),
        password: expect.any(String),
      }),
    );
    req.flush(null);

    await expect(registerPromise).resolves.not.toThrow();
  });
});
