import { Component } from '@angular/core';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent {
  open = false;

  title = '';
  text = '';

  result = new Subject<boolean>();

  onCancel() {
    this.result.next(false);

    this.open = false;
  }

  onOk() {
    this.result.next(true);

    this.open = false;
  }
}

export function openModal(
  title: string,
  text: string,
  modal: ConfirmModalComponent,
) {
  modal.title = title;
  modal.text = text;
  modal.open = true;

  return modal.result.toPromise();
}
