import {
  passwordRequirementsText,
  validatePassword,
  validatePasswordsMatch,
} from './password.lib';

describe('password.lib', () => {
  it('should validate good passwords', () => {
    expect(validatePassword('Password1!')).toBeNull();
  });

  it('should invalidate no lowercase passwords', () => {
    expect(validatePassword('PASSWORD1!')).toEqual({
      nolowercase: true,
    });
  });

  it('should invalidate no uppercase passwords', () => {
    expect(validatePassword('password1!')).toEqual({
      nouppercase: true,
    });
  });

  it('should invalidate no digit passwords', () => {
    expect(validatePassword('Password!')).toEqual({
      nodigit: true,
    });
  });

  it('should invalidate no special character passwords', () => {
    expect(validatePassword('Password1')).toEqual({
      nospecialcharacter: true,
    });
  });

  it('should describe password requirements in plain English', () => {
    const text = passwordRequirementsText('en');
    expect(typeof text).toEqual('string');
  });

  it('should check that passwords match', () => {
    expect(validatePasswordsMatch('a_password', 'a_password')).toBeNull();

    expect(
      validatePasswordsMatch('a_password', 'a_different_password'),
    ).toEqual({
      passwordsdonotmatch: true,
    });
  });
});
