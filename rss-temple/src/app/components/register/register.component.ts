import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AlertService, LoginService } from '@app/services';
import {
  isValidPassword,
  passwordRequirementsText,
  doPasswordsMatch,
} from '@app/libs/password.lib';
import { FormGroupErrors } from '@app/libs/formgrouperrors.lib';

enum State {
  Ready,
  IsRegistering,
  RegisterFailed,
}

@Component({
  templateUrl: 'register.component.html',
  styleUrls: ['register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  state = State.Ready;
  readonly State = State;

  registerForm: FormGroup;
  registerFormErrors = new FormGroupErrors();

  private googleToken: string | null = null;
  private facebookToken: string | null = null;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private loginService: LoginService,
    private alertService: AlertService,
  ) {
    this.registerForm = this.formBuilder.group(
      {
        email: [
          this.route.snapshot.paramMap.get('email') ?? '',
          [Validators.required, Validators.email],
        ],
        password: ['', [Validators.required, isValidPassword()]],
        passwordCheck: ['', [Validators.required]],
      },
      {
        validators: [doPasswordsMatch('password', 'passwordCheck')],
      },
    );

    this.registerFormErrors.initializeControls(this.registerForm);
  }

  ngOnInit() {
    this.googleToken = this.route.snapshot.paramMap.get('g_token');
    this.facebookToken = this.route.snapshot.paramMap.get('fb_token');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onRegister() {
    this.registerFormErrors.clearErrors();
    if (this.registerForm.invalid) {
      this.state = State.RegisterFailed;

      const errors = this.registerForm.errors;
      if (errors !== null) {
        if (errors.passwordsdonotmatch) {
          this.registerFormErrors.errors.push('Passwords do not match');
        }
      }

      const emailErrors = this.registerForm.controls.email.errors;
      if (emailErrors !== null) {
        if (emailErrors.required) {
          this.registerFormErrors.controls['email'].push('Email required');
        }

        if (emailErrors.email) {
          this.registerFormErrors.controls['email'].push('Email malformed');
        }
      }

      const passwordErrors = this.registerForm.controls.password.errors;
      if (passwordErrors !== null) {
        if (passwordErrors.required) {
          this.registerFormErrors.controls['password'].push(
            'Password required',
          );
        }

        if (
          passwordErrors.minlength ||
          passwordErrors.nolowercase ||
          passwordErrors.nouppercase ||
          passwordErrors.nodigit ||
          passwordErrors.nospecialcharacter
        ) {
          this.registerFormErrors.controls['password'].push(
            passwordRequirementsText('en'),
          );
        }
      }

      const passwordCheckErrors = this.registerForm.controls.passwordCheck
        .errors;
      if (passwordCheckErrors !== null) {
        if (passwordCheckErrors.required) {
          this.registerFormErrors.controls['passwordCheck'].push(
            'Password required',
          );
        }
      }
      return;
    }

    this.state = State.IsRegistering;

    if (this.googleToken !== null) {
      this.loginService
        .createGoogleLogin(
          this.registerForm.controls.email.value as string,
          this.registerForm.controls.password.value as string,
          this.googleToken,
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: this.handleRegisterSuccess.bind(this),
          error: this.handleRegisterError.bind(this),
        });
    } else if (this.facebookToken !== null) {
      this.loginService
        .createFacebookLogin(
          this.registerForm.controls.email.value as string,
          this.registerForm.controls.password.value as string,
          this.facebookToken,
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: this.handleRegisterSuccess.bind(this),
          error: this.handleRegisterError.bind(this),
        });
    } else {
      this.loginService
        .createMyLogin(
          this.registerForm.controls.email.value as string,
          this.registerForm.controls.password.value as string,
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: this.handleRegisterSuccess.bind(this),
          error: this.handleRegisterError.bind(this),
        });
    }
  }

  private handleRegisterSuccess() {
    this.zone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  private handleRegisterError(error: any) {
    let errorMessage = 'Unknown Error';
    switch (error.status) {
      case 0:
        errorMessage = 'Unable to connect to server';
        break;
      case 409:
        errorMessage = 'Email already in use';
        break;
    }

    this.zone.run(() => {
      this.alertService.error(errorMessage, 5000);

      this.state = State.RegisterFailed;
    });
  }
}
