import { Component, OnDestroy, NgZone } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { validate as emailValidate } from 'email-validator';

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
  emailErrors: string[] = [];

  result = new Subject<void>();

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
    this.emailErrors = [];
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next();
    }

    this.open = open;
  }

  request() {
    this.state = State.Sending;

    this.emailErrors = [];

    const email = this.email.trim();

    if (email.length < 1) {
      this.emailErrors.push('Email required');
      this.state = State.Error;
      return;
    }

    if (!emailValidate(email)) {
      this.emailErrors.push('Email malformed');
      this.state = State.Error;
      return;
    }

    this.passwordResetTokenService
      .request(this.email)
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
