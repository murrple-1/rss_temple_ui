import {
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  Validators,
  FormGroup,
} from '@angular/forms';

export const MinLength = 6;

export const SpecialCharacters = ['!', '@', '#', '$', '%', '^', '&'];

export function isValidPassword(): ValidatorFn | null {
  return Validators.compose([
    Validators.minLength(MinLength),
    (control: AbstractControl) => {
      let validationErrors: ValidationErrors | null = null;

      const value = control.value as string;

      if (!/[a-z]/.test(value)) {
        validationErrors = validationErrors || {};
        validationErrors['noLowerCase'] = true;
      }

      if (!/[A-Z]/.test(value)) {
        validationErrors = validationErrors || {};
        validationErrors['noUpperCase'] = true;
      }

      if (!/[0-9]/.test(value)) {
        validationErrors = validationErrors || {};
        validationErrors['noDigit'] = true;
      }

      if (!/[!@#\$%\^&]/.test(value)) {
        validationErrors = validationErrors || {};
        validationErrors['noSpecialCharacter'] = true;
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
      validationErrors = validationErrors || {};
      validationErrors['doesNotMatch'] = true;
    }

    return validationErrors;
  };
}
