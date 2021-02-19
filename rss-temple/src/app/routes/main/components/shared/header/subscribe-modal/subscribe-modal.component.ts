import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

export interface SubscriptionDetails {
  feedUrl: string;
  customTitle?: string;
}

@Component({
  selector: 'app-subscribe-modal',
  templateUrl: './subscribe-modal.component.html',
  styleUrls: ['./subscribe-modal.component.scss'],
})
export class SubscribeModalComponent implements OnDestroy {
  open = false;
  submitted = false;

  feedUrl = '';
  customName = '';

  result = new Subject<SubscriptionDetails>();

  @ViewChild('subscribeForm', { static: false })
  _subscribeForm?: NgForm;

  ngOnDestroy() {
    this.result.complete();
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next();
    }

    this.open = open;
  }

  reset() {
    this.feedUrl = '';
    this.customName = '';
  }

  finish() {
    if (this._subscribeForm === undefined) {
      throw new Error('_subscribeForm undefined');
    }

    if (this._subscribeForm.invalid) {
      return;
    }

    this.submitted = true;

    const feedUrl = this.feedUrl.trim();
    if (feedUrl.length < 1) {
      return;
    }

    let customName: string | undefined;
    const _customName = this.customName;
    if (_customName.trim() !== '') {
      customName = _customName;
    }

    const result: SubscriptionDetails = {
      feedUrl: this.feedUrl,
      customTitle: customName,
    };
    this.open = false;
    this.result.next(result);
  }
}

export function openModal(modal: SubscribeModalComponent) {
  modal.reset();
  modal.open = true;

  return modal.result.pipe(take(1)).toPromise();
}
