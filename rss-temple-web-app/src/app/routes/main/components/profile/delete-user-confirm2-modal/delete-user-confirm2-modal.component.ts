import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ClrLoadingState } from '@clr/angular';
import { Subject, firstValueFrom } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { AlertEntry } from '@app/components/shared/local-alerts/local-alerts.component';
import { HttpErrorService } from '@app/services';
import { AuthService } from '@app/services/data';

@Component({
  selector: 'app-delete-user-confirm2-modal',
  templateUrl: './delete-user-confirm2-modal.component.html',
  styleUrls: ['./delete-user-confirm2-modal.component.scss'],
  standalone: false,
})
export class DeleteUserConfirm2ModalComponent implements OnDestroy {
  private zone = inject(NgZone);
  private authService = inject(AuthService);
  private httpErrorService = inject(HttpErrorService);

  open = false;

  requestButtonState = ClrLoadingState.DEFAULT;
  readonly ClrLoadingState = ClrLoadingState;

  password = '';

  alertEntries: AlertEntry[] | null = null;

  result = new Subject<boolean>();

  @ViewChild('deleteUserForm', { static: true })
  _deleteUserForm?: NgForm;

  private readonly unsubscribe$ = new Subject<void>();

  ngOnDestroy() {
    this.result.complete();

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  reset() {
    this.password = '';
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

  startDelete() {
    if (this._deleteUserForm?.invalid) {
      return;
    }

    this.requestButtonState = ClrLoadingState.LOADING;
    this.alertEntries = null;

    this.authService
      .deleteUser(this.password)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.result.next(true);

          this.zone.run(() => {
            this.open = false;
          });
        },
        error: error => {
          let errorHandled = false;
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 401: {
                this.zone.run(() => {
                  this.alertEntries = [
                    {
                      iconShape: null,
                      text: 'Password wrong',
                      type: 'danger',
                    },
                  ];
                  this.requestButtonState = ClrLoadingState.DEFAULT;
                });
                errorHandled = true;
                break;
              }
            }
          }

          if (!errorHandled) {
            this.httpErrorService.handleError(error);

            this.zone.run(() => {
              this.requestButtonState = ClrLoadingState.DEFAULT;
            });
          }
        },
      });
  }
}

export function openModal(modal: DeleteUserConfirm2ModalComponent) {
  modal.reset();
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
