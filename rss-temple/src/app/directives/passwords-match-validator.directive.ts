import { Directive, Input } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  NG_VALIDATORS,
  Validator,
} from '@angular/forms';

import { validatePasswordsMatch } from '@app/libs/password.lib';

@Directive({
  selector: '[appPasswordsMatch]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordsMatchValidatorDirective,
      multi: true,
    },
  ],
})
export class PasswordsMatchValidatorDirective implements Validator {
  private _password1ControlName?: string;
  private _password2ControlName?: string;

  @Input('appPassword1ControlName')
  get password1ControlName() {
    return this._password1ControlName;
  }

  set password1ControlName(value: string | undefined) {
    this._password1ControlName = value;
    if (this.validatorChangeCallback !== undefined) {
      this.validatorChangeCallback();
    }
  }

  @Input('appPassword2ControlName')
  get password2ControlName() {
    return this._password2ControlName;
  }

  set password2ControlName(value: string | undefined) {
    this._password2ControlName = value;
    if (this.validatorChangeCallback !== undefined) {
      this.validatorChangeCallback();
    }
  }

  private validatorChangeCallback?: () => void;

  validate(control: AbstractControl) {
    if (
      this.password1ControlName === undefined ||
      this.password2ControlName === undefined
    ) {
      return null;
    }

    if (!(control instanceof FormGroup)) {
      return null;
    }

    const password1Control = control.controls[this.password1ControlName];
    if (!password1Control) {
      return null;
    }

    const password2Control = control.controls[this.password2ControlName];
    if (!password2Control) {
      return null;
    }

    const password1 = password1Control.value;
    if (typeof password1 !== 'string') {
      return null;
    }

    const password2 = password2Control.value;
    if (typeof password2 !== 'string') {
      return null;
    }

    return validatePasswordsMatch(password1, password2);
  }

  registerOnValidatorChange(fn: () => void) {
    this.validatorChangeCallback = fn;
  }
}
