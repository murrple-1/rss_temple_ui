import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { afterEach, beforeEach, describe, it } from 'vitest';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { SocialService } from './social.service';

describe('SocialService', () => {
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

  it('should create "google" login', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const socialService = TestBed.inject(SocialService);

    // TODO implement
  });

  it('should create "facebook" login', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const socialService = TestBed.inject(SocialService);

    // TODO implement
  });

  it('should create "google" session', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const socialService = TestBed.inject(SocialService);

    // TODO implement
  });

  it('should create "google" session', async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const socialService = TestBed.inject(SocialService);

    // TODO implement
  });
});
