import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClrLoadingState } from '@clr/angular';
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

import {
  RequestPasswordResetModalComponent,
  openModal as openRequestPasswordResetModal,
} from '@app/components/login/request-password-reset-modal/request-password-reset-modal.component';
import { AlertEntry } from '@app/components/shared/local-alerts/local-alerts.component';
import { passwordContainerOverride } from '@app/libs/password-container-override';
import {
  AppAlertsService,
  AuthStateService,
  FBAuthService,
  GAuthService,
  ModalOpenService,
} from '@app/services';
import { AuthService, SocialService } from '@app/services/data';

function getCachedEmail() {
  return localStorage.getItem('login:cachedEmail');
}

function setCachedEmailInLocalStorage(email: string) {
  localStorage.setItem('login:cachedEmail', email);
}

function removeCachedEmailFromStorage() {
  localStorage.removeItem('login:cachedEmail');
}

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  email = '';
  password = '';
  rememberMe = false;

  readonly ClrLoadingState = ClrLoadingState;
  loginButtonState = ClrLoadingState.DEFAULT;
  loginAlertEntries: AlertEntry[] = [];

  _returnUrl: string | null = null;

  gLoaded = false;
  fbLoaded = false;
  gButtonInUse = false;
  fbButtonInUse = false;

  @ViewChild('loginForm', { static: true })
  loginForm?: NgForm;

  @ViewChild(RequestPasswordResetModalComponent)
  _requestPasswordResetModal?: RequestPasswordResetModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef<Element>,
    private renderer: Renderer2,
    private gAuthService: GAuthService,
    private fbAuthService: FBAuthService,
    private authService: AuthService,
    private socialService: SocialService,
    private appAlertsService: AppAlertsService,
    private authStateService: AuthStateService,
    private modalOpenService: ModalOpenService,
  ) {}

  ngOnInit() {
    const email = getCachedEmail();

    if (email !== null) {
      this.email = email;
      this.rememberMe = true;
    }

    this._returnUrl = this.route.snapshot.paramMap.get('returnUrl') ?? '/main';

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
            const idToken = user.getAuthResponse().id_token as
              | string
              | null
              | undefined;
            if (typeof idToken === 'string') {
              this.handleGoogleUser(idToken);
            }
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
            const accessToken = user.accessToken;
            if (typeof accessToken === 'string') {
              this.handleFacebookUser(accessToken);
            }
          }
        },
      });
  }

  ngAfterViewInit() {
    passwordContainerOverride(this.elementRef, this.renderer);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onLogin() {
    if (this.loginForm === undefined) {
      throw new Error();
    }

    this.loginAlertEntries = [];

    if (this.loginForm.invalid) {
      return;
    }

    this.loginButtonState = ClrLoadingState.LOADING;

    const email = this.email;

    this.authService
      .login(email, this.password)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: authResponse => {
          if (this.rememberMe) {
            setCachedEmailInLocalStorage(email);

            AuthStateService.setCSRFTokenInLocalStorage(authResponse.csrfToken);
          } else {
            removeCachedEmailFromStorage();
          }
          AuthStateService.setCSRFTokenInSessionStorage(authResponse.csrfToken);
          this.zone.run(() => {
            this.handleLoginSuccess(authResponse.csrfToken);
          });
        },
        error: error => {
          let errorHandled = false;
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 0: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Unable to connect to server',
                  type: 'danger',
                });
                this.zone.run(() => {
                  this.loginButtonState = ClrLoadingState.DEFAULT;
                });
                errorHandled = true;
                break;
              }
              case 401: {
                this.zone.run(() => {
                  this.loginAlertEntries = [
                    {
                      text: 'Email or password is wrong',
                      iconShape: 'exclamation-triangle',
                      type: 'warning',
                    },
                  ];
                  this.loginButtonState = ClrLoadingState.DEFAULT;
                });
                errorHandled = true;
                break;
              }
              case 429: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Request throttled: Please try again in a few minutes',
                  type: 'warning',
                });
                this.zone.run(() => {
                  this.loginButtonState = ClrLoadingState.DEFAULT;
                });
                errorHandled = true;
                break;
              }
            }
          }

          if (!errorHandled) {
            console.error('Unknown Error', error);
            this.appAlertsService.appAlertDescriptor$.next({
              autoCloseInterval: 5000,
              canClose: true,
              text: 'Unknown Error',
              type: 'danger',
            });
            this.zone.run(() => {
              this.loginButtonState = ClrLoadingState.DEFAULT;
            });
          }
        },
      });
  }

  private handleLoginSuccess(csrfToken: string) {
    this.authStateService.csrfToken$.next(csrfToken);

    this.router.navigate([this._returnUrl]);
  }

  async onGoogleLogin() {
    this.gButtonInUse = true;
    try {
      await this.gAuthService.signIn();
    } catch (e) {
      console.error(e);
      this.gButtonInUse = false;
    }
  }

  private handleGoogleUser(idToken: string) {
    this.socialService
      .googleLogin(idToken)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: authResponse => {
          if (this.rememberMe) {
            AuthStateService.setCSRFTokenInLocalStorage(authResponse.csrfToken);
          }
          AuthStateService.setCSRFTokenInSessionStorage(authResponse.csrfToken);
          this.zone.run(() => {
            this.handleLoginSuccess(authResponse.csrfToken);
          });
        },
        error: error => {
          this.zone.run(() => {
            this.gButtonInUse = false;
          });

          let errorHandled = false;
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 0: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Unable to connect to server',
                  type: 'danger',
                });
                errorHandled = true;
                break;
              }
              case 422: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: "Account already exists with that email, but Google account isn't linked. To login with Google, login via another method, then link your Google account",
                  type: 'danger',
                });
                errorHandled = true;
                break;
              }
              case 429: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Request throttled: Please try again in a few minutes',
                  type: 'warning',
                });
                errorHandled = true;
                break;
              }
            }
          }

          if (!errorHandled) {
            this.appAlertsService.appAlertDescriptor$.next({
              autoCloseInterval: 5000,
              canClose: true,
              text: 'Unknown Error',
              type: 'danger',
            });
          }
        },
      });
  }

  async onFacebookLogin() {
    this.fbButtonInUse = true;
    try {
      await this.fbAuthService.signIn();
    } catch (e) {
      console.error(e);
      this.fbButtonInUse = false;
    }
  }

  private handleFacebookUser(accessToken: string) {
    this.socialService
      .facebookLogin(accessToken)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: authResponse => {
          if (this.rememberMe) {
            AuthStateService.setCSRFTokenInLocalStorage(authResponse.csrfToken);
          }
          AuthStateService.setCSRFTokenInSessionStorage(authResponse.csrfToken);
          this.zone.run(() => {
            this.handleLoginSuccess(authResponse.csrfToken);
          });
        },
        error: error => {
          this.zone.run(() => {
            this.fbButtonInUse = false;
          });

          let errorHandled = false;
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 0: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Unable to connect to server',
                  type: 'danger',
                });
                errorHandled = true;
                break;
              }
              case 422: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: "Account already exists with that email, but Facebook account isn't linked. To login with Facebook, login via another method, then link your Facebook account",
                  type: 'danger',
                });
                errorHandled = true;
                break;
              }
              case 429: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Request throttled: Please try again in a few minutes',
                  type: 'warning',
                });
                errorHandled = true;
                break;
              }
            }
          }

          if (!errorHandled) {
            this.appAlertsService.appAlertDescriptor$.next({
              autoCloseInterval: 5000,
              canClose: true,
              text: 'Unknown Error',
              type: 'danger',
            });
          }
        },
      });
  }

  async onForgottenPassword() {
    if (this._requestPasswordResetModal === undefined) {
      throw new Error();
    }
    this.modalOpenService.isModalOpen$.next(true);
    await openRequestPasswordResetModal(this._requestPasswordResetModal);
    this.modalOpenService.isModalOpen$.next(false);
  }
}
