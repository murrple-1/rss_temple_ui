import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface SubscriptionDetails {
  feedUrl: string;
}

@Component({
  templateUrl: 'subscribemodal.component.html',
  styleUrls: ['subscribemodal.component.scss'],
})
export class SubscribeModalComponent {
  subscribeForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
  ) {
    this.subscribeForm = this.formBuilder.group({
      feedUrl: ['', [Validators.required]],
    });
  }

  dismiss() {
    this.activeModal.dismiss();
  }

  finish() {
    this.submitted = true;
    if (this.subscribeForm.invalid) {
      return;
    }

    const result: SubscriptionDetails = {
      feedUrl: this.subscribeForm.controls.feedUrl.value,
    };
    this.activeModal.close(result);
  }
}
