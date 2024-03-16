import { MockCookieService } from '@app/test/cookie.service.mock';

import { AuthStateService } from './auth-state.service';

function setup() {
  const mockCookieService = new MockCookieService({});
  const authStateService = new AuthStateService(mockCookieService);

  return {
    authStateService,
  };
}

describe('AuthStateService', () => {
  beforeEach(() => {
    const mockCookieService = new MockCookieService({});
    const authStateService = new AuthStateService(mockCookieService);
    authStateService.removeLoggedInFlagFromCookieStorage();
    authStateService.removeLoggedInFlagFromLocalStorage();
  });

  it('should construct', () => {
    const { authStateService } = setup();

    expect(authStateService).not.toBeNull();
  });

  // TODO more tests
});
