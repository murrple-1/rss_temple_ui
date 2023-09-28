import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { Observable, Subject, forkJoin } from 'rxjs';
import { map, skip, takeUntil } from 'rxjs/operators';

import {
  MinLength as PasswordMinLength,
  SpecialCharacters as PasswordSpecialCharacters,
  passwordRequirementsTextHtml,
} from '@app/libs/password.lib';
import {
  DeleteUserConfirm1ModalComponent,
  openModal as openDeleteUserConfirm1Modal,
} from '@app/routes/main/components/profile/delete-user-confirm1-modal/delete-user-confirm1-modal.component';
import {
  DeleteUserConfirm2ModalComponent,
  openModal as openDeleteUserConfirm2Modal,
} from '@app/routes/main/components/profile/delete-user-confirm2-modal/delete-user-confirm2-modal.component';
import {
  GlobalUserCategoriesModalComponent,
  openModal as openGlobalUserCategoriesModal,
} from '@app/routes/main/components/profile/global-user-categories-modal/global-user-categories-modal.component';
import { ReadCounterService } from '@app/routes/main/services';
import {
  AppAlertsService,
  AuthTokenService,
  FBAuthService,
  GAuthService,
  HttpErrorService,
  ModalOpenService,
} from '@app/services';
import {
  AuthService,
  FeedService,
  OPMLService,
  SocialService,
  UserMetaService,
} from '@app/services/data';

enum State {
  IsLoading,
  LoadSuccess,
  LoadError,
  IsSaving,
  SaveSuccess,
  SaveError,
}

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  state = State.IsLoading;
  readonly State = State;

  email = '';
  oldPassword = '';
  newPassword = '';
  newPasswordCheck = '';

  hasGoogleLogin = false;
  hasFacebookLogin = false;

  numberOfFeeds = 0;
  numberOfReadFeedEntries = 0;
  numberOfUnreadFeedEntries$ = this.readCounterService.feedCounts$.pipe(
    map(feedCounts =>
      Object.values(feedCounts).reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        0,
      ),
    ),
  );

  gLoaded = false;
  fbLoaded = false;
  gButtonInUse = false;
  fbButtonInUse = false;

  isDownloadOPMLButtonDisabled: boolean;

  @ViewChild('profileDetailsForm', { static: true })
  profileDetailsForm?: NgForm;

  @ViewChild(GlobalUserCategoriesModalComponent, { static: true })
  private globalUserCategoriesModal?: GlobalUserCategoriesModalComponent;

  @ViewChild(DeleteUserConfirm1ModalComponent, { static: true })
  private deleteUserConfirm1Modal?: DeleteUserConfirm1ModalComponent;

  @ViewChild(DeleteUserConfirm2ModalComponent, { static: true })
  private deleteUserConfirm2Modal?: DeleteUserConfirm2ModalComponent;

  readonly passwordHelperTextHtml = passwordRequirementsTextHtml('en');
  readonly passwordMinLength = PasswordMinLength;
  readonly passwordSpecialCharacters = PasswordSpecialCharacters.join('');

  get isPasswordChanging() {
    return (
      this.oldPassword.length > 0 ||
      this.newPassword.length > 0 ||
      this.newPasswordCheck.length > 0
    );
  }

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private router: Router,
    private authTokenService: AuthTokenService,
    private feedService: FeedService,
    private userMetaService: UserMetaService,
    private opmlService: OPMLService,
    private authService: AuthService,
    private socialService: SocialService,
    private readCounterService: ReadCounterService,
    private httpErrorService: HttpErrorService,
    private gAuthService: GAuthService,
    private fbAuthService: FBAuthService,
    private appAlertsService: AppAlertsService,
    private modalOpenService: ModalOpenService,
  ) {
    this.isDownloadOPMLButtonDisabled = window.Blob === undefined;
  }

  ngOnInit() {
    forkJoin([
      this.authService.getUser(),
      this.socialService.socialList(),
      this.feedService
        .query({
          returnObjects: false,
          returnTotalCount: true,
          search: 'subscribed:"true"',
        })
        .pipe(
          map(response => {
            if (response.totalCount !== undefined) {
              return response.totalCount;
            }
            throw new Error('malformed response');
          }),
        ),
      this.userMetaService.getReadCount(),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([user, socialList, feedsCount, readFeedEntriesCount]) => {
          this.zone.run(() => {
            this.email = user.email;

            this.hasGoogleLogin = socialList.some(
              si => si.provider === 'google',
            );
            this.hasFacebookLogin = socialList.some(
              si => si.provider === 'facebook',
            );

            this.numberOfFeeds = feedsCount;
            this.numberOfReadFeedEntries = readFeedEntriesCount;

            this.state = State.LoadSuccess;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);

          this.zone.run(() => {
            this.state = State.LoadError;
          });
        },
      });

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
          if (user !== null) {
            const token = user.getAuthResponse().id_token as
              | string
              | null
              | undefined;
            if (typeof token === 'string') {
              this.handleGoogleUser(token);
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

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async linkGoogle() {
    this.gButtonInUse = true;
    try {
      await this.gAuthService.signIn();
    } catch (e) {
      console.error(e);
    }
    this.gButtonInUse = false;
  }

  private handleGoogleUser(token: string) {
    this.socialService
      .googleConnect(token)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.hasGoogleLogin = true;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  async linkFacebook() {
    this.fbButtonInUse = true;
    try {
      await this.fbAuthService.signIn();
    } catch (e) {
      console.error(e);
    }
    this.fbButtonInUse = false;
  }

  private handleFacebookUser(token: string) {
    this.socialService
      .facebookConnect(token)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.hasFacebookLogin = true;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  async unlinkGoogle() {
    await this.gAuthService.signOut();

    this.hasGoogleLogin = false;

    this.socialService
      .googleDisconnect()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        error: error => {
          let errorHandled = false;
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 409: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Unlinking would make your account unaccessible. Link another account type, or setup a password first',
                  type: 'danger',
                });
                this.zone.run(() => {
                  this.hasGoogleLogin = true;
                });
                errorHandled = true;
                break;
              }
            }
          }

          if (!errorHandled) {
            this.httpErrorService.handleError(error);

            this.zone.run(() => {
              this.hasGoogleLogin = true;
            });
          }
        },
      });
  }

  async unlinkFacebook() {
    await this.fbAuthService.signOut();

    this.hasFacebookLogin = false;

    this.socialService
      .facebookDisconnect()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        error: error => {
          let errorHandled = false;
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 409: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Unlinking would make your account unaccessible. Link another account type, or setup a password first',
                  type: 'danger',
                });
                this.zone.run(() => {
                  this.hasFacebookLogin = true;
                });
                errorHandled = true;
                break;
              }
            }
          }

          if (!errorHandled) {
            this.httpErrorService.handleError(error);

            this.zone.run(() => {
              this.hasGoogleLogin = true;
            });
          }
        },
      });
  }

  onSave() {
    if (this.profileDetailsForm === undefined) {
      throw new Error();
    }

    if (this.profileDetailsForm.pristine) {
      this.appAlertsService.appAlertDescriptor$.next({
        autoCloseInterval: 5000,
        canClose: true,
        text: 'Profile Saved',
        type: 'info',
      });

      this.state = State.SaveSuccess;
      return;
    }

    if (this.profileDetailsForm.invalid) {
      return;
    }

    const saveObservables: Observable<unknown>[] = [];

    if (
      this.profileDetailsForm.controls['oldPassword']?.dirty &&
      this.profileDetailsForm.controls['newPassword']?.dirty &&
      this.profileDetailsForm.controls['newPasswordCheck']?.dirty
    ) {
      saveObservables.push(
        this.authService.changePassword(this.oldPassword, this.newPassword),
      );
    }

    this.state = State.IsSaving;

    forkJoin(saveObservables)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.appAlertsService.appAlertDescriptor$.next({
            autoCloseInterval: 5000,
            canClose: true,
            text: 'Profile Saved',
            type: 'info',
          });

          this.profileDetailsForm?.resetForm({
            email: this.email,
            oldPassword: '',
            newPassword: '',
            newPasswordCheck: '',
          });

          this.zone.run(() => {
            this.state = State.SaveSuccess;
          });
        },
        error: error => {
          let errorHandled = false;
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 400: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Profile failed to save',
                  type: 'danger',
                });
                errorHandled = true;
                break;
              }
              case 403: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Old password wrong',
                  type: 'danger',
                });
                errorHandled = true;
                break;
              }
            }
          }

          if (!errorHandled) {
            this.httpErrorService.handleError(error);
          }

          this.zone.run(() => {
            this.state = State.SaveError;
          });
        },
      });
  }

  downloadOPML() {
    this.opmlService
      .download()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: opmlData => {
          saveAs(new Blob([opmlData]), 'temple.opml');
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  async editUserCategories() {
    if (this.globalUserCategoriesModal === undefined) {
      throw new Error();
    }

    this.modalOpenService.isModalOpen$.next(true);
    await openGlobalUserCategoriesModal(this.globalUserCategoriesModal);
    this.modalOpenService.isModalOpen$.next(false);
  }

  resetOnboarding() {
    this.authService
      .updateUserAttributes({
        onboarded: null,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe();
  }

  async deleteUser() {
    if (this.deleteUserConfirm1Modal === undefined) {
      throw new Error('deleteUserConfirm1Modal undefined');
    }

    if (this.deleteUserConfirm2Modal === undefined) {
      throw new Error('deleteUserConfirm2Modal undefined');
    }

    const agreed = await openDeleteUserConfirm1Modal(
      this.deleteUserConfirm1Modal,
    );
    if (agreed) {
      const done = await openDeleteUserConfirm2Modal(
        this.deleteUserConfirm2Modal,
      );
      if (done) {
        this.authTokenService.authToken$.next(null);
        localStorage.removeItem('auth-token-service:authToken');
        sessionStorage.removeItem('auth-token-service:authToken');

        this.router.navigate(['/login']);
      }
    }
  }
}
