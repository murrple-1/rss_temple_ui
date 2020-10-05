import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil, skip } from 'rxjs/operators';

import {
  AlertService,
  LoginService,
  GAuthService,
  FBAuthService,
} from '@app/services';
import { setSessionToken } from '@app/libs/session.lib';
import { openModal as openPasswordResetModal } from '@app/components/login/requestpasswordresetmodal/requestpasswordresetmodal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroupErrors } from '@app/libs/formgrouperrors.lib';

export enum State {
  Ready,
  IsLoggingIn,
  LoginFailed,
}

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  state = State.Ready;
  readonly State = State;

  loginForm: FormGroup;
  loginFormErrors = new FormGroupErrors();

  returnUrl: string | null = null;

  gLoaded = false;
  fbLoaded = false;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private modal: NgbModal,
    private loginService: LoginService,
    private alertService: AlertService,
    private gAuthService: GAuthService,
    private fbAuthService: FBAuthService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.loginFormErrors.initializeControls(this.loginForm);
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.paramMap.get('returnUrl') ?? '/main';

    this.gAuthService.isLoaded$.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: isLoaded => {
        if (isLoaded !== this.gLoaded) {
          this.zone.run(() => {
            this.gLoaded = isLoaded;
          });
        }

        if (!isLoaded) {
          this.gAuthService.load();
        }
      },
    });

    if (this.gAuthService.user !== null) {
      this.gAuthService.signOut();
    }

    this.gAuthService.user$
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe({
        next: user => {
          this.zone.run(() => {
            this.state = State.Ready;
          });

          if (user) {
            this.handleGoogleUser(user);
          }
        },
      });

    this.fbAuthService.isLoaded$.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: isLoaded => {
        if (isLoaded !== this.fbLoaded) {
          this.zone.run(() => {
            this.fbLoaded = isLoaded;
          });
        }

        if (!isLoaded) {
          this.fbAuthService.load();
        }
      },
    });

    if (this.fbAuthService.user !== null) {
      this.fbAuthService.signOut();
    }

    this.fbAuthService.user$
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe({
        next: user => {
          this.zone.run(() => {
            this.state = State.Ready;
          });

          if (user) {
            this.handleFacebookUser(user);
          }
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onLogin() {
    this.loginFormErrors.clearErrors();
    if (this.loginForm.invalid) {
      this.state = State.LoginFailed;

      const emailErrors = this.loginForm.controls['email'].errors;
      if (emailErrors !== null) {
        if (emailErrors.required) {
          this.loginFormErrors.controls['email'].push('Email required');
        }

        if (emailErrors.email) {
          this.loginFormErrors.controls['email'].push('Email malformed');
        }
      }

      const passwordErrors = this.loginForm.controls['password'].errors;
      if (passwordErrors !== null) {
        /* istanbul ignore else */
        if (passwordErrors.required) {
          this.loginFormErrors.controls['password'].push('Password required');
        }
      }

      return;
    }

    this.state = State.IsLoggingIn;

    this.loginService
      .getMyLoginSession(
        this.loginForm.controls['email'].value as string,
        this.loginForm.controls['password'].value as string,
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: this.handleLoginSuccess.bind(this),
        error: error => {
          let errorMessage = 'Unknown Error';
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 0:
                errorMessage = 'Unable to connect to server';
                break;
              case 403:
                errorMessage = 'Email or password wrong';
                break;
            }
          }

          console.error(errorMessage, error);
          this.alertService.error(errorMessage, 5000);

          this.zone.run(() => {
            this.state = State.LoginFailed;
          });
        },
      });
  }

  private handleLoginSuccess(sessionToken: string) {
    this.zone.run(() => {
      setSessionToken(sessionToken);

      this.router.navigate([this.returnUrl]);
    });
  }

  onGoogleLogin() {
    this.state = State.IsLoggingIn;
    this.gAuthService.signIn();
  }

  private handleGoogleUser(user: gapi.auth2.GoogleUser) {
    this.loginService
      .getGoogleLoginSession(user)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: this.handleLoginSuccess.bind(this),
        error: error => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 422) {
              this.zone.run(() => {
                this.router.navigate([
                  '/register',
                  { g_token: error.error.token, email: error.error.email },
                ]);
              });
            } else {
              let errorMessage = 'Unknown Error';
              switch (error.status) {
                case 0:
                  errorMessage = 'Unable to connect to server';
                  break;
              }

              console.error(errorMessage, error);

              this.alertService.error(errorMessage, 5000);

              this.zone.run(() => {
                this.state = State.LoginFailed;
              });
            }
          } else {
            const errorMessage = 'Unknown Error';

            console.error(errorMessage, error);

            this.alertService.error(errorMessage, 5000);

            this.zone.run(() => {
              this.state = State.LoginFailed;
            });
          }
        },
      });
  }

  onFacebookLogin() {
    this.state = State.IsLoggingIn;
    this.fbAuthService.signIn();
  }

  private handleFacebookUser(user: fb.AuthResponse) {
    this.loginService
      .getFacebookLoginSession(user)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: this.handleLoginSuccess.bind(this),
        error: error => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 422) {
              this.router.navigate([
                '/register',
                { fb_token: error.error.token, email: error.error.email },
              ]);
            } else {
              let errorMessage = 'Unknown Error';
              switch (error.status) {
                case 0:
                  errorMessage = 'Unable to connect to server';
                  break;
              }

              this.alertService.error(errorMessage, 5000);

              this.zone.run(() => {
                this.state = State.LoginFailed;
              });
            }
          } else {
            const errorMessage = 'Unknown Error';

            console.error(errorMessage, error);

            this.alertService.error(errorMessage, 5000);

            this.zone.run(() => {
              this.state = State.LoginFailed;
            });
          }
        },
      });
  }

  async onForgottenPassword() {
    const modalRef = openPasswordResetModal(this.modal);

    try {
      await modalRef.result;
    } catch {
      // do nothing
    }
  }
}
