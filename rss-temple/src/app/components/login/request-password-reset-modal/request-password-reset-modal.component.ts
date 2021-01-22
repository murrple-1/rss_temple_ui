import { Component, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PasswordResetTokenService } from '@app/services/data';
import { HttpErrorService } from '@app/services';

export enum State {
  NotStarted,
  Sending,
  Error,
}

@Component({
  selector: 'app-request-password-reset-modal',
  templateUrl: './request-password-reset-modal.component.html',
  styleUrls: ['./request-password-reset-modal.component.scss'],
})
export class RequestPasswordResetModalComponent implements OnDestroy {
  open = false;

  state = State.NotStarted;
  readonly State = State;

  email = '';

  result = new Subject<void>();

  @ViewChild('passwordResetRequestForm', { static: true })
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
    this.state = State.NotStarted;
    this.email = '';
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

    this.state = State.Sending;

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
            this.state = State.Error;
          });
        },
      });
  }
}

export function openModal(modal: RequestPasswordResetModalComponent) {
  modal.reset();
  modal.open = true;

  return modal.result.toPromise();
}
