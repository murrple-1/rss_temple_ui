import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroupErrors } from '@app/libs/formgrouperrors.lib';

export interface SubscriptionDetails {
  feedUrl: string;
  customTitle?: string;
}

@Component({
  templateUrl: 'subscribemodal.component.html',
  styleUrls: ['subscribemodal.component.scss'],
})
export class SubscribeModalComponent {
  submitted = false;

  subscribeForm: FormGroup;
  subscribeFormErrors = new FormGroupErrors();

  constructor(
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
  ) {
    this.subscribeForm = this.formBuilder.group({
      feedUrl: ['', [Validators.required]],
      customName: [''],
    });

    this.subscribeFormErrors.initializeControls(this.subscribeForm);
  }

  dismiss() {
    this.activeModal.dismiss();
  }

  finish() {
    this.submitted = true;

    this.subscribeFormErrors.clearErrors();
    if (this.subscribeForm.invalid) {
      const urlErrors = this.subscribeForm.controls.feedUrl.errors;
      if (urlErrors !== null) {
        if (urlErrors.required) {
          this.subscribeFormErrors.controls.feedUrl.push('URL required');
        }
      }
      return;
    }

    let customName: string | undefined;
    const customName_ = this.subscribeForm.controls.customName.value as string;
    if (customName_.trim() !== '') {
      customName = customName_;
    }

    const result: SubscriptionDetails = {
      feedUrl: this.subscribeForm.controls.feedUrl.value as string,
      customTitle: customName,
    };
    this.activeModal.close(result);
  }
}
