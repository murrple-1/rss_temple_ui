import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { isWebUri } from 'valid-url';

@Directive({
  selector: '[appUrl]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: UrlValidatorDirective,
      multi: true,
    },
  ],
})
export class UrlValidatorDirective implements Validator {
  validate(control: AbstractControl) {
    const url = control.value;
    if (typeof url !== 'string') {
      return null;
    }

    if (isWebUri(url) !== undefined) {
      return null;
    }

    return {
      invalidurl: true,
    };
  }
}
