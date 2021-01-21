import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

import { validatePassword } from '@app/libs/password.lib';

@Directive({
  selector: '[appPassword]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordValidatorDirective,
      multi: true,
    },
  ],
})
export class PasswordValidatorDirective implements Validator {
  validate(control: AbstractControl) {
    const password = control.value;
    if (typeof password !== 'string') {
      return null;
    }

    if (password.length < 1) {
      return null;
    }

    return validatePassword(password);
  }
}
