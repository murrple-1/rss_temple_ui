import {
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  Validators,
  FormGroup,
} from '@angular/forms';

import { sprintf } from 'sprintf-js';

export const MinLength = 6;

export const SpecialCharacters = ['!', '@', '#', '$', '%', '^', '&'];

export function isValidPassword(): ValidatorFn | null {
  return Validators.compose([
    Validators.minLength(MinLength),
    (control: AbstractControl) => {
      let validationErrors: ValidationErrors | null = null;

      const value = control.value as string;

      if (!/[a-z]/.test(value)) {
        validationErrors = validationErrors ?? {};
        validationErrors.nolowercase = true;
      }

      if (!/[A-Z]/.test(value)) {
        validationErrors = validationErrors ?? {};
        validationErrors.nouppercase = true;
      }

      if (!/[0-9]/.test(value)) {
        validationErrors = validationErrors ?? {};
        validationErrors.nodigit = true;
      }

      if (!/[!@#\$%\^&]/.test(value)) {
        validationErrors = validationErrors ?? {};
        validationErrors.nospecialcharacter = true;
      }

      return validationErrors;
    },
  ]);
}

export function doPasswordsMatch(password1Name: string, password2Name: string) {
  return (group: FormGroup) => {
    let validationErrors: ValidationErrors | null = null;

    const password1 = group.controls[password1Name].value as string;
    const password2 = group.controls[password2Name].value as string;

    if (password1 !== password2) {
      validationErrors = validationErrors ?? {};
      validationErrors.passwordsdonotmatch = true;
    }

    return validationErrors;
  };
}

export function passwordRequirementsText(_lang: string) {
  return sprintf(
    'Your password must be 6 or more characters long, ' +
      'contain 1 uppercase and 1 lowercase letters, 1 number, and 1 special character ' +
      '(%(specialCharacters)s)',
    {
      specialCharacters: SpecialCharacters.join(''),
    },
  );
}
