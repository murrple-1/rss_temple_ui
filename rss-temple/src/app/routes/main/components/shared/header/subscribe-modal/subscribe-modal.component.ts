import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

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

  return modal.result.toPromise();
}
