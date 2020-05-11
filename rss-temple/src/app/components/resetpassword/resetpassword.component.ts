import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PasswordResetTokenService } from '@app/services/data';
import { HttpErrorService } from '@app/services';
import {
  isValidPassword,
  doPasswordsMatch,
  passwordRequirementsText,
} from '@app/libs/password.lib';
import { FormGroupErrors } from '@app/libs/formgrouperrors.lib';

enum State {
  NotStarted,
  Sending,
  Success,
  BadToken,
  Error,
  NoToken,
}

@Component({
  templateUrl: 'resetpassword.component.html',
  styleUrls: ['resetpassword.component.scss'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private static readonly timeoutInterval = 2000;

  state = State.NotStarted;
  readonly State = State;

  private token: string | null = null;

  resetPasswordForm: FormGroup;
  resetPasswordFormErrors = new FormGroupErrors();

  get passwordRequirementsText() {
    return passwordRequirementsText('en');
  }

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private passwordResetTokenService: PasswordResetTokenService,
    private httpErrorService: HttpErrorService,
  ) {
    this.resetPasswordForm = this.formBuilder.group(
      {
        newPassword: ['', [Validators.required, isValidPassword()]],
        newPasswordCheck: ['', [Validators.required]],
      },
      {
        validators: [doPasswordsMatch('newPassword', 'newPasswordCheck')],
      },
    );

    this.resetPasswordFormErrors.initializeControls(this.resetPasswordForm);
  }

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
    if (this.token === null) {
      return;
    }

    this.resetPasswordFormErrors.clearErrors();
    if (this.resetPasswordForm.invalid) {
      this.state = State.Error;

      const errors = this.resetPasswordForm.errors;
      if (errors !== null) {
        if (errors.passwordsdonotmatch) {
          this.resetPasswordFormErrors.errors.push('Passwords do not match');
        }
      }

      const newPasswordErrors = this.resetPasswordForm.controls.newPassword
        .errors;
      if (newPasswordErrors !== null) {
        if (newPasswordErrors.required) {
          this.resetPasswordFormErrors.controls['newPassword'].push(
            'Password required',
          );
        }

        if (
          newPasswordErrors.nolowercase ||
          newPasswordErrors.nouppercase ||
          newPasswordErrors.nodigit ||
          newPasswordErrors.nospecialcharacters
        ) {
          this.resetPasswordFormErrors.controls['newPassword'].push(
            passwordRequirementsText('en'),
          );
        }
      }

      const newPasswordCheckErrors = this.resetPasswordForm.controls
        .newPasswordCheck.errors;
      if (newPasswordCheckErrors !== null) {
        if (newPasswordCheckErrors.required) {
          this.resetPasswordFormErrors.controls['newPasswordCheck'].push(
            'Password required',
          );
        }
      }

      return;
    }

    this.state = State.Sending;

    this.passwordResetTokenService
      .reset({
        token: this.token,
        password: this.resetPasswordForm.controls.newPassword.value as string,
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
