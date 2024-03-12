import { AuthStateService } from './auth-state.service';

function setup() {
  const authStateService = new AuthStateService();

  return {
    authStateService,
  };
}

describe('AuthStateService', () => {
  it('should construct', () => {
    const { authStateService } = setup();

    expect(authStateService).not.toBeNull();
  });

  // TODO more tests
});
