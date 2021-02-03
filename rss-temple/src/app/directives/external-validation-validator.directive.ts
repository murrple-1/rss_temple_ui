import { Directive, Input, Optional, Self } from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  NgControl,
  ValidationErrors,
} from '@angular/forms';

@Directive({
  selector: '[appExternalValidation]',
})
export class ExternalValidationValidatorDirective {
  private _externalValidation: ValidationErrors | null = null;
  private control: AbstractControl;

  @Input('appExternalValidation')
  get externalValidation() {
    return this._externalValidation;
  }

  set externalValidation(value: ValidationErrors | null) {
    this._externalValidation = value;

    let errors: ValidationErrors | null = null;
    if (this.control.errors !== null) {
      errors = { ...this.control.errors };
    }

    if (this._externalValidation !== null) {
      errors = { ...errors, ...this._externalValidation };
    }

    this.control.setErrors(errors);
  }

  constructor(
    @Self() @Optional() form: ControlContainer | null,
    @Self() @Optional() control: NgControl | null,
  ) {
    if (form !== null && form.control !== null) {
      this.control = form.control;
    } else if (control !== null && control.control !== null) {
      this.control = control.control;
    } else {
      throw new Error('not connected to a form component');
    }
  }
}
