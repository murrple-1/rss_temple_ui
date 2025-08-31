import { Component, OnDestroy } from '@angular/core';
import { ClrIconModule, ClrModalModule } from '@clr/angular';
import { Subject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-delete-user-confirm1-modal',
  templateUrl: './delete-user-confirm1-modal.component.html',
  styleUrls: ['./delete-user-confirm1-modal.component.scss'],
  imports: [ClrModalModule, ClrIconModule],
})
export class DeleteUserConfirm1ModalComponent implements OnDestroy {
  open = false;

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

  onContinue() {
    this.result.next(true);

    this.open = false;
  }
}

export function openModal(modal: DeleteUserConfirm1ModalComponent) {
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
