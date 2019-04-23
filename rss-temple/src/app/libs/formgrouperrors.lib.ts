import { FormGroup } from '@angular/forms';

export class FormGroupErrors {
  errors: string[] = [];
  controls: {
    [name: string]: string[];
  } = {};

  initializeControls(formGroup: FormGroup) {
    for (const key of Object.keys(formGroup.controls)) {
      this.controls[key] = [];
    }
  }

  clearErrors() {
    this.errors = [];

    for (const key of Object.keys(this.controls)) {
      this.controls[key] = [];
    }
  }
}
