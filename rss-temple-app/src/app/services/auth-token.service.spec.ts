import { AuthTokenService } from './auth-token.service';

function setup() {
  const authTokenService = new AuthTokenService();

  return {
    authTokenService,
  };
}

describe('AuthTokenService', () => {
  it('should construct', () => {
    const { authTokenService } = setup();

    expect(authTokenService).not.toBeNull();
  });

  // TODO more tests
});
