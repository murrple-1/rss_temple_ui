import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PasswordResetTokenService } from '@app/_services/data';
import { HttpErrorService } from '@app/_services';
import {
  isValidPassword,
  doPasswordsMatch,
  passwordRequirementsText,
} from '@app/_modules/password.module';

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

  get passwordRequirementsText() {
    return passwordRequirementsText('en');
  }

  private unsubscribe$ = new Subject<void>();

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
        newPassword: ['', [isValidPassword()]],
        newPasswordCheck: ['', [isValidPassword()]],
      },
      {
        validators: [doPasswordsMatch('newPassword', 'newPasswordCheck')],
      },
    );
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

    if (
      this.resetPasswordForm.errors &&
      this.resetPasswordForm.errors.passwordErrors
    ) {
      this.state = State.Error;
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
