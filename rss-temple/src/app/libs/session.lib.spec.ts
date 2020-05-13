import {
  sessionToken,
  setSessionToken,
  deleteSessionToken,
} from './session.lib';

describe('session.lib', () => {
  beforeEach(() => {
    deleteSessionToken();
  });

  it('should return an null session token by default', () => {
    expect(sessionToken()).toBeNull();
  });

  it('should be possible to set and retrieve session token', () => {
    const token = 'token';
    setSessionToken(token);
    expect(sessionToken()).toBe(token);
  });

  it('should be possible to delete a set token', () => {
    const token = 'token';
    setSessionToken(token);
    expect(sessionToken()).toBe(token);

    deleteSessionToken();
    expect(sessionToken()).toBeNull();
  });
});
