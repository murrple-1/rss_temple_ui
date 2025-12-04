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
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ClrCheckboxModule,
  ClrCommonFormsModule,
  ClrIconModule,
  ClrInputModule,
  ClrLoadingButtonModule,
  ClrLoadingModule,
  ClrLoadingState,
  ClrPasswordModule,
} from '@clr/angular';
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

import {
  RequestPasswordResetModalComponent,
  openModal as openRequestPasswordResetModal,
} from '@app/components/login/request-password-reset-modal/request-password-reset-modal.component';
import { AlertEntry } from '@app/components/shared/local-alerts/local-alerts.component';
import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';
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
  imports: [
    FormsModule,
    ClrCommonFormsModule,
    ClrInputModule,
    ClrPasswordModule,
    ClrCheckboxModule,
    LocalAlertsComponent,
    ClrLoadingButtonModule,
    ClrLoadingModule,
    RouterLink,
    ClrIconModule,
    RequestPasswordResetModalComponent,
  ],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  private zone = inject(NgZone);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private elementRef = inject<ElementRef<Element>>(ElementRef);
  private renderer = inject(Renderer2);
  private gAuthService = inject(GAuthService);
  private fbAuthService = inject(FBAuthService);
  private authService = inject(AuthService);
  private socialService = inject(SocialService);
  private appAlertsService = inject(AppAlertsService);
  private authStateService = inject(AuthStateService);
  private modalOpenService = inject(ModalOpenService);

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

  @ViewChild(RequestPasswordResetModalComponent, { static: true })
  _requestPasswordResetModal?: RequestPasswordResetModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

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

    const rememberMe = this.rememberMe;

    this.authService
      .login(email, this.password, rememberMe)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: _authResponse => {
          if (rememberMe) {
            this.authStateService.setLoggedInFlagInLocalStorage();
            setCachedEmailInLocalStorage(email);
          } else {
            removeCachedEmailFromStorage();
          }
          this.zone.run(() => {
            this.handleLoginSuccess();
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
                  key: 'unable-to-connect',
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
                  key: 'throttled',
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
              key: 'unknown-error',
            });
            this.zone.run(() => {
              this.loginButtonState = ClrLoadingState.DEFAULT;
            });
          }
        },
      });
  }

  private handleLoginSuccess() {
    this.authStateService.setLoggedInFlagInCookieStorage();
    this.authStateService.isLoggedIn$.next(true);

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
    const rememberMe = this.rememberMe;

    this.socialService
      .googleLogin(idToken, rememberMe)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: _authResponse => {
          if (rememberMe) {
            this.authStateService.setLoggedInFlagInLocalStorage();
          }
          this.zone.run(() => {
            this.handleLoginSuccess();
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
                  key: 'unable-to-connect',
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
                  key: null,
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
                  key: 'throttled',
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
              key: 'unknown-error',
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
    const rememberMe = this.rememberMe;
    this.socialService
      .facebookLogin(accessToken, rememberMe)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: _authResponse => {
          if (rememberMe) {
            this.authStateService.setLoggedInFlagInLocalStorage();
          }
          this.zone.run(() => {
            this.handleLoginSuccess();
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
                  key: 'unable-to-connect',
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
                  key: null,
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
                  key: 'throttled',
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
              key: 'unknown-error',
            });
          }
        },
      });
  }

  async onForgottenPassword() {
    const requestPasswordResetModal = this._requestPasswordResetModal;
    if (requestPasswordResetModal === undefined) {
      throw new Error();
    }
    this.modalOpenService.openModal(async () => {
      await openRequestPasswordResetModal(requestPasswordResetModal);
    });
  }
}
