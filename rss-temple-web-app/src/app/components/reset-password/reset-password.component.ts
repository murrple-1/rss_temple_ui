import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { hexToUuid } from '@app/libs/hex-to-uuid.lib';
import {
  MinLength as PasswordMinLength,
  SpecialCharacters as PasswordSpecialCharacters,
  passwordRequirementsText,
} from '@app/libs/password.lib';
import { AppAlertsService, HttpErrorService } from '@app/services';
import { AuthService } from '@app/services/data';

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
  private userUuidHex: string | null = null;

  @ViewChild('resetPasswordForm', { static: false })
  _resetPasswordForm?: NgForm;

  private redirectTimeoutHandle: number | null = null;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private authService: AuthService,
    private appAlertsService: AppAlertsService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnInit() {
    this.token = this.activatedRoute.snapshot.queryParamMap.get('token');
    this.userUuidHex = this.activatedRoute.snapshot.queryParamMap.get('userId');

    if (this.token === null || this.userUuidHex === null) {
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

    if (this.userUuidHex === null) {
      return;
    }

    if (this._resetPasswordForm.invalid) {
      return;
    }

    let userUuid: string;
    try {
      userUuid = hexToUuid(this.userUuidHex);
    } catch (e: unknown) {
      console.error('userId is not correcctly formatted', e);
      this.state = State.BadToken;
      return;
    }

    this.state = State.Sending;

    this.authService
      .resetPassword(this.token, userUuid, this.newPassword)
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
          let errorHandled = false;
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 404: {
                this.zone.run(() => {
                  this.state = State.BadToken;
                });
                errorHandled = true;
                break;
              }
              case 422: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Password was determined to be too easy to guess based on internal analysis. Please try a different password',
                  type: 'danger',
                });
                this.zone.run(() => {
                  this.state = State.Error;
                });
                errorHandled = true;
                break;
              }
            }
          }

          if (!errorHandled) {
            this.httpErrorService.handleError(error);

            this.zone.run(() => {
              this.state = State.Error;
            });
          }
        },
      });
  }
}
