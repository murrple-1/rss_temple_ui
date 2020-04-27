import { ValidatorFn, FormControl } from '@angular/forms';

import { isValidPassword } from './password.lib';

describe('AppComponent', () => {
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
});
