import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

import { validate as validateEmail } from 'email-validator';

@Directive({
  selector: '[appEmail]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: EmailValidatorDirective,
      multi: true,
    },
  ],
})
export class EmailValidatorDirective implements Validator {
  validate(control: AbstractControl) {
    const email = control.value;
    if (typeof email !== 'string') {
      return null;
    }

    if (email.length < 1) {
      return null;
    }

    if (validateEmail(email)) {
      return null;
    }

    return {
      invalidemail: true,
    };
  }
}
