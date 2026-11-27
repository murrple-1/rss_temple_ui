import { describe, expect, it } from 'vitest';

import {
  passwordRejectedText,
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

  it('should show the backend messages for a rejected password', () => {
    expect(
      passwordRejectedText({ password: ['This password is too common.'] }),
    ).toBe('This password is too common. Please try a different password');

    expect(
      passwordRejectedText({
        password: [
          'This password is too common.',
          'This password must contain at least 1 digit.',
        ],
      }),
    ).toBe(
      'This password is too common. This password must contain at least 1 digit. Please try a different password',
    );

    expect(
      passwordRejectedText({ password: 'This password is too common.' }),
    ).toBe('This password is too common. Please try a different password');
  });

  it('should show a general message for an unreadable rejection', () => {
    const text = 'Password was not accepted. Please try a different password';

    expect(passwordRejectedText(null)).toBe(text);
    expect(passwordRejectedText('error')).toBe(text);
    expect(passwordRejectedText({})).toBe(text);
    expect(passwordRejectedText({ password: [] })).toBe(text);
    expect(passwordRejectedText({ password: { password: ['x'] } })).toBe(text);
  });
});
