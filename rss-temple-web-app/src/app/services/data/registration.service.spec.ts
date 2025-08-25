import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { RegistrationService } from './registration.service';

describe('RegistrationService', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>('HttpClient', [
            'post',
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
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    });
  });

  it('should register', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const registrationService = TestBed.inject(RegistrationService);

      httpClientSpy.post.and.returnValue(of<void>());

      await firstValueFrom(
        registrationService.register(
          'test@test.com',
          'password',
          'captchaKey',
          'captchaSecretPhrase',
        ),
        { defaultValue: undefined },
      );
      expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
      expect(httpClientSpy.post).toHaveBeenCalledWith(
        jasmine.stringMatching(/\/api\/registration$/),
        jasmine.objectContaining({
          email: jasmine.any(String),
          password: jasmine.any(String),
        }),
      );
    });
  }));
});
