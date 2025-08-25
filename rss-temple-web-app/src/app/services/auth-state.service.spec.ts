import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';

import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { AuthStateService } from './auth-state.service';

describe('AuthStateService', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MOCK_COOKIE_SERVICE_CONFIG,
          useValue: {},
        },
        {
          provide: CookieService,
          useClass: MockCookieService,
        },
      ],
    });
  });

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      const authStateService = TestBed.inject(AuthStateService);
      authStateService.removeLoggedInFlagFromCookieStorage();
      authStateService.removeLoggedInFlagFromLocalStorage();
    });
  });

  it('should construct', () => {
    TestBed.runInInjectionContext(() => {
      const authStateService = TestBed.inject(AuthStateService);

      expect(authStateService).not.toBeNull();
    });
  });

  // TODO more tests
});
