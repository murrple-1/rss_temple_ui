import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';

import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { AuthStateService } from './auth-state.service';

describe('AuthStateService', () => {
  beforeEach(() => {
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
    const authStateService = TestBed.inject(AuthStateService);
    authStateService.removeLoggedInFlagFromCookieStorage();
    authStateService.removeLoggedInFlagFromLocalStorage();
  });

  it('should construct', () => {
    const authStateService = TestBed.inject(AuthStateService);

    expect(authStateService).not.toBeNull();
  });

  // TODO more tests
});
