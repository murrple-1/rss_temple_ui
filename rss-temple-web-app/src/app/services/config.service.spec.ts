import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from './config.service';

describe('ConfigService', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>('HttpClient', ['get']),
        },
      ],
    });
  });

  it('should construct', () => {
    TestBed.runInInjectionContext(() => {
      const configService = TestBed.inject(ConfigService);

      expect(configService).not.toBeNull();
    });
  });

  // TODO more tests
});
