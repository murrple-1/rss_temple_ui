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
} from '@app/_services';
import { setSessionToken } from '@app/_modules/session.module';
import { RequestPasswordResetModalComponent } from '@app/login/requestpasswordresetmodal/requestpasswordresetmodal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

enum State {
  Ready,
  IsLoggingIn,
  LoginFailed,
}

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  state = State.Ready;
  readonly State = State;

  loginForm: FormGroup;

  returnUrl: string | null = null;

  gLoaded = false;
  fbLoaded = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private modalService: NgbModal,
    private loginService: LoginService,
    private alertService: AlertService,
    private gAuthService: GAuthService,
    private fbAuthService: FBAuthService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.paramMap.get('returnUrl') || '/main';

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
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$),
      )
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
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$),
      )
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
    this.state = State.Ready;

    if (this.loginForm.invalid) {
      return;
    }

    this.state = State.IsLoggingIn;
    this.loginService
      .getMyLoginSession(
        this.loginForm.controls.email.value as string,
        this.loginForm.controls.password.value as string,
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

          console.log(errorMessage, error);
          this.alertService.error(errorMessage, 5000);

          this.zone.run(() => {
            this.state = State.LoginFailed;
          });
        },
      });
  }

  private handleLoginSuccess(data: string | Object) {
    if (typeof data === 'string') {
      this.zone.run(() => {
        setSessionToken(data);

        this.router.navigate([this.returnUrl]);
      });
    } else {
      throw new Error('data is not a string');
    }
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

              console.log(errorMessage, error);

              this.alertService.error(errorMessage, 5000);

              this.zone.run(() => {
                this.state = State.LoginFailed;
              });
            }
          } else {
            const errorMessage = 'Unknown Error';

            console.log(errorMessage, error);

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

            console.log(errorMessage, error);

            this.alertService.error(errorMessage, 5000);

            this.zone.run(() => {
              this.state = State.LoginFailed;
            });
          }
        },
      });
  }

  onForgottenPassword() {
    const modalRef = this.modalService.open(RequestPasswordResetModalComponent);

    modalRef.result.then(
      () => {
        // done, no-op
      },
      error => {
        // dialog dismissed, no-op
      },
    );
  }
}
