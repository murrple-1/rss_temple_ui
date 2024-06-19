import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import isValidDomain from 'is-valid-domain';

@Directive({
  selector: '[appFediverseInstance]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: FediverseInstanceValidatorDirective,
      multi: true,
    },
  ],
})
export class FediverseInstanceValidatorDirective implements Validator {
  validate(control: AbstractControl) {
    const instance = control.value;
    if (typeof instance !== 'string') {
      return null;
    }

    if (isValidDomain(instance, { subdomain: true, allowUnicode: true })) {
      return null;
    }

    return {
      invalidfediverseinstance: true,
    };
  }
}
