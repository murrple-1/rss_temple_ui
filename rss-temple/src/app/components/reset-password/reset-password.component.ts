import { Component, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PasswordResetTokenService } from '@app/services/data';
import { HttpErrorService } from '@app/services';
import {
  MinLength as PasswordMinLength,
  passwordRequirementsText,
  SpecialCharacters as PasswordSpecialCharacters,
} from '@app/libs/password.lib';

enum State {
  NotStarted,
  Sending,
  Success,
  BadToken,
  Error,
  NoToken,
}

@Component({
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private static readonly timeoutInterval = 2000;

  state = State.NotStarted;
  readonly State = State;

  newPassword = '';
  newPasswordCheck = '';

  readonly passwordHelperText = passwordRequirementsText('en');
  readonly passwordMinLength = PasswordMinLength;
  readonly passwordSpecialCharacters = PasswordSpecialCharacters.join('');

  private token: string | null = null;

  @ViewChild('resetPasswordForm', { static: false })
  _resetPasswordForm?: NgForm;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private passwordResetTokenService: PasswordResetTokenService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnInit() {
    this.token = this.activatedRoute.snapshot.queryParamMap.get('token');

    if (this.token === null) {
      this.state = State.NoToken;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSave() {
    if (this._resetPasswordForm === undefined) {
      throw new Error('_resetPasswordForm undefined');
    }

    if (this.token === null) {
      return;
    }

    if (this._resetPasswordForm.invalid) {
      return;
    }

    this.state = State.Sending;

    this.passwordResetTokenService
      .reset({
        token: this.token,
        password: this.newPassword,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.state = State.Success;
          });

          window.setTimeout(() => {
            this.router.navigate(['/login']);
          }, ResetPasswordComponent.timeoutInterval);
        },
        error: error => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.zone.run(() => {
              this.state = State.BadToken;
            });
          } else {
            this.httpErrorService.handleError(error);

            this.zone.run(() => {
              this.state = State.Error;
            });
          }
        },
      });
  }
}
