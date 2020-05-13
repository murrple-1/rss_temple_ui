import { ValidatorFn, FormControl, FormGroup } from '@angular/forms';

import {
  isValidPassword,
  passwordRequirementsText,
  doPasswordsMatch,
} from './password.lib';

describe('password.lib', () => {
  it('should create a validator function', () => {
    const validator = isValidPassword();
    expect(validator).not.toBeNull();
  });

  it('should validate good passwords', () => {
    const validator = isValidPassword() as ValidatorFn;

    const formControl = new FormControl();

    formControl.setValue('Password1!');
    expect(validator(formControl)).toBeNull();
  });

  it('should invalidate no lowercase passwords', () => {
    const validator = isValidPassword() as ValidatorFn;

    const formControl = new FormControl();

    formControl.setValue('PASSWORD1!');
    expect(validator(formControl)).toEqual({
      nolowercase: true,
    });
  });

  it('should invalidate no uppercase passwords', () => {
    const validator = isValidPassword() as ValidatorFn;

    const formControl = new FormControl();

    formControl.setValue('password1!');
    expect(validator(formControl)).toEqual({
      nouppercase: true,
    });
  });

  it('should invalidate no digit passwords', () => {
    const validator = isValidPassword() as ValidatorFn;

    const formControl = new FormControl();

    formControl.setValue('Password!');
    expect(validator(formControl)).toEqual({
      nodigit: true,
    });
  });

  it('should invalidate no special character passwords', () => {
    const validator = isValidPassword() as ValidatorFn;

    const formControl = new FormControl();

    formControl.setValue('Password1');
    expect(validator(formControl)).toEqual({
      nospecialcharacter: true,
    });
  });

  it('should describe password requirements in plain English', () => {
    const text = passwordRequirementsText('en');
    expect(typeof text).toEqual('string');
  });

  it('should check that passwords match', () => {
    const validator = doPasswordsMatch('password1', 'password2');

    const formGroup = new FormGroup({
      password1: new FormControl(),
      password2: new FormControl(),
    });

    formGroup.controls['password1'].setValue('a_password');
    formGroup.controls['password2'].setValue('a_password');

    expect(validator(formGroup)).toBeNull();

    formGroup.controls['password1'].setValue('a_different_password');
    expect(validator(formGroup)).toEqual({
      passwordsdonotmatch: true,
    });
  });
});
