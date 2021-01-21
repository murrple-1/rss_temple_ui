import {
  Component,
  OnInit,
  ElementRef,
  Renderer2,
  AfterViewChecked,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ClrLoadingState } from '@clr/angular';

import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

import { passwordContainerOverride } from '@app/libs/password-container-override';
import {
  AppAlertsService,
  FBAuthService,
  GAuthService,
  LoginService,
} from '@app/services';
import { setSessionToken } from '@app/libs/session.lib';
import {
  RequestPasswordResetModalComponent,
  openModal as openRequestPasswordResetModal,
} from './request-password-reset-modal/request-password-reset-modal.component';

interface LoginWithButtonDescriptor {
  url: string;
  imageUrl: string;
}

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewChecked, OnDestroy {
  email = '';
  emailErrors: string[] = [];
  password = '';
  passwordErrors: string[] = [];
  rememberMe = false;

  loginButtonState = ClrLoadingState.DEFAULT;

  loginWithButtons: LoginWithButtonDescriptor[] = [];

  returnUrl: string | null = null;

  gLoaded = false;
  fbLoaded = false;

  @ViewChild(RequestPasswordResetModalComponent)
  private requestPasswordResetModalComponent?: RequestPasswordResetModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef<Element>,
    private renderer: Renderer2,
    private gAuthService: GAuthService,
    private fbAuthService: FBAuthService,
    private loginService: LoginService,
    private appAlertsService: AppAlertsService,
  ) {}

  ngOnInit() {
    const email = localStorage.getItem('cached_email');
    const password = localStorage.getItem('cached_password');

    if (email !== null && password !== null) {
      this.email = email;
      this.password = password;
      this.rememberMe = true;
    }

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
          if (user) {
            this.handleFacebookUser(user);
          }
        },
      });
  }

  ngAfterViewChecked() {
    passwordContainerOverride(this.elementRef, this.renderer);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onLogin() {
    this.emailErrors = [];
    this.passwordErrors = [];

    let inputError = false;

    const email = this.email.trim();
    if (email.length < 1) {
      this.emailErrors = ['Email missing'];
      inputError = true;
    }

    const password = this.password.trim();
    if (password.length < 1) {
      this.passwordErrors = ['Password missing'];
      inputError = true;
    }

    if (inputError) {
      return;
    }

    this.loginButtonState = ClrLoadingState.LOADING;

    this.loginService
      .getMyLoginSession(this.email, this.password)
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
          this.appAlertsService.appAlertDescriptor$.next({
            autoCloseInterval: 5000,
            canClose: true,
            text: errorMessage,
            type: 'danger',
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
              this.appAlertsService.appAlertDescriptor$.next({
                autoCloseInterval: 5000,
                canClose: true,
                text: errorMessage,
                type: 'danger',
              });
            }
          } else {
            const errorMessage = 'Unknown Error';

            console.error(errorMessage, error);

            this.appAlertsService.appAlertDescriptor$.next({
              autoCloseInterval: 5000,
              canClose: true,
              text: errorMessage,
              type: 'danger',
            });
          }
        },
      });
  }

  onFacebookLogin() {
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

              this.appAlertsService.appAlertDescriptor$.next({
                autoCloseInterval: 5000,
                canClose: true,
                text: errorMessage,
                type: 'danger',
              });
            }
          } else {
            const errorMessage = 'Unknown Error';

            console.error(errorMessage, error);
            this.appAlertsService.appAlertDescriptor$.next({
              autoCloseInterval: 5000,
              canClose: true,
              text: errorMessage,
              type: 'danger',
            });
          }
        },
      });
  }

  async onForgottenPassword() {
    if (this.requestPasswordResetModalComponent === undefined) {
      throw new Error('requestPasswordResetModalComponent undefined');
    }

    await openRequestPasswordResetModal(
      this.requestPasswordResetModalComponent,
    );
  }
}
