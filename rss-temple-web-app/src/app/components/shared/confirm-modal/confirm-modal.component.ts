import { Component, OnDestroy } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  standalone: false,
})
export class ConfirmModalComponent implements OnDestroy {
  open = false;

  title = '';
  text = '';

  result = new Subject<boolean>();

  ngOnDestroy() {
    this.result.complete();
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next(false);
    }

    this.open = open;
  }

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

  return firstValueFrom(modal.result.pipe(take(1)));
}
