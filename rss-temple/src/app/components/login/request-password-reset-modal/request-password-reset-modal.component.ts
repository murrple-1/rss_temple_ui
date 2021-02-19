import { Component, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ClrLoadingState } from '@clr/angular';

import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { PasswordResetTokenService } from '@app/services/data';
import { HttpErrorService } from '@app/services';

@Component({
  selector: 'app-request-password-reset-modal',
  templateUrl: './request-password-reset-modal.component.html',
  styleUrls: ['./request-password-reset-modal.component.scss'],
})
export class RequestPasswordResetModalComponent implements OnDestroy {
  open = false;

  requestButtonState = ClrLoadingState.DEFAULT;
  readonly ClrLoadingState = ClrLoadingState;

  email = '';

  result = new Subject<void>();

  @ViewChild('passwordResetRequestForm', { static: false })
  _passwordResetRequestForm?: NgForm;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private passwordResetTokenService: PasswordResetTokenService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnDestroy() {
    this.result.complete();

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  reset() {
    if (this._passwordResetRequestForm === undefined) {
      throw new Error('_passwordResetRequestForm undefined');
    }

    this.requestButtonState = ClrLoadingState.DEFAULT;
    this.email = '';
    this._passwordResetRequestForm.resetForm();
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next();
    }

    this.open = open;
  }

  request() {
    if (this._passwordResetRequestForm?.invalid) {
      return;
    }

    this.requestButtonState = ClrLoadingState.LOADING;

    const email = this.email.trim();

    this.passwordResetTokenService
      .request(email)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.result.next();

          this.zone.run(() => {
            this.open = false;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);

          this.zone.run(() => {
            this.requestButtonState = ClrLoadingState.DEFAULT;
          });
        },
      });
  }
}

export function openModal(modal: RequestPasswordResetModalComponent) {
  modal.reset();
  modal.open = true;

  return modal.result.pipe(take(1)).toPromise();
}
