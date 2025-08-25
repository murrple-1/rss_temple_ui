import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { CaptchaService } from './captcha.service';

describe('CaptchaService', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>('HttpClient', ['post']),
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

  it('should get new key', fakeAsync(async () => {
    await TestBed.runInInjectionContext(async () => {
      const httpClientSpy = TestBed.inject(
        HttpClient,
      ) as jasmine.SpyObj<HttpClient>;
      const captchaService = TestBed.inject(CaptchaService);

      httpClientSpy.post.and.returnValue(of('newkey'));

      await firstValueFrom(captchaService.getKey());
      expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
    });
  }));

  // TODO more tests
});
