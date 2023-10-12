import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject, firstValueFrom } from 'rxjs';
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

  result = new Subject<SubscriptionDetails | undefined>();

  @ViewChild('subscribeForm', { static: true })
  _subscribeForm?: NgForm;

  ngOnDestroy() {
    this.result.complete();
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next(undefined);
    }

    this.open = open;
  }

  reset() {
    if (this._subscribeForm === undefined) {
      throw new Error();
    }
    this._subscribeForm.resetForm({
      feedUrl: '',
      customName: '',
    });
  }

  finish() {
    if (this._subscribeForm === undefined) {
      throw new Error();
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

  return firstValueFrom(modal.result.pipe(take(1)));
}
