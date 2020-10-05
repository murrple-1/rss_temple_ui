import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
} from '@ng-bootstrap/ng-bootstrap';
import { FormGroupErrors } from '@app/libs/formgrouperrors.lib';
import { NgbModalRef } from '@app/libs/ngb-modal.lib';

export interface SubscriptionDetails {
  feedUrl: string;
  customTitle?: string;
}

@Component({
  templateUrl: './subscribemodal.component.html',
  styleUrls: ['./subscribemodal.component.scss'],
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
      const urlErrors = this.subscribeForm.controls['feedUrl'].errors;
      if (urlErrors !== null) {
        if (urlErrors.required) {
          this.subscribeFormErrors.controls['feedUrl'].push('URL required');
        }
      }
      return;
    }

    let customName: string | undefined;
    const _customName = this.subscribeForm.controls['customName']
      .value as string;
    if (_customName.trim() !== '') {
      customName = _customName;
    }

    const result: SubscriptionDetails = {
      feedUrl: this.subscribeForm.controls['feedUrl'].value as string,
      customTitle: customName,
    };
    this.activeModal.close(result);
  }
}

export function openModal(modal: NgbModal, options: NgbModalOptions = {}) {
  const defaultOptions: NgbModalOptions = {};

  options = { ...defaultOptions, ...options };

  const modalRef = modal.open(SubscribeModalComponent, options) as NgbModalRef<
    SubscriptionDetails,
    SubscribeModalComponent
  >;

  return modalRef;
}
