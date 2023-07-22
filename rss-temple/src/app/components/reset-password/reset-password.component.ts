import { Component, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '@app/services/data';
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
  private static readonly redirectTimeoutInterval = 2000;

  state = State.NotStarted;
  readonly State = State;

  newPassword = '';
  newPasswordCheck = '';

  readonly passwordHelperText = passwordRequirementsText('en');
  readonly passwordMinLength = PasswordMinLength;
  readonly passwordSpecialCharacters = PasswordSpecialCharacters.join('');

  private token: string | null = null;
  private userId: string | null = null;

  @ViewChild('resetPasswordForm', { static: false })
  _resetPasswordForm?: NgForm;

  private redirectTimeoutHandle: number | null = null;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private authService: AuthService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnInit() {
    this.token = this.activatedRoute.snapshot.queryParamMap.get('token');
    this.userId = this.activatedRoute.snapshot.queryParamMap.get('userId');

    if (this.token === null || this.userId === null) {
      this.state = State.NoToken;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.redirectTimeoutHandle !== null) {
      window.clearTimeout(this.redirectTimeoutHandle);
    }
  }

  onSave() {
    if (this._resetPasswordForm === undefined) {
      throw new Error();
    }

    if (this.token === null) {
      return;
    }

    if (this.userId === null) {
      return;
    }

    if (this._resetPasswordForm.invalid) {
      return;
    }

    this.state = State.Sending;

    this.authService
      .resetPassword(this.token, this.userId, this.newPassword)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.state = State.Success;
          });

          this.redirectTimeoutHandle = window.setTimeout(() => {
            this.router.navigate(['/login']);
          }, ResetPasswordComponent.redirectTimeoutInterval);
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
