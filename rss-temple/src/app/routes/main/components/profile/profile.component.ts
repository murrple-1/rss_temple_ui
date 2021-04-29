import { Component, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';

import { forkJoin, Subject } from 'rxjs';
import { takeUntil, skip, map } from 'rxjs/operators';

import { saveAs } from 'file-saver';

import {
  FeedService,
  FeedEntryService,
  UserService,
  OPMLService,
} from '@app/services/data';
import {
  HttpErrorService,
  GAuthService,
  FBAuthService,
  AppAlertsService,
} from '@app/services';
import { UpdateUserBody } from '@app/services/data/user.service';
import {
  MinLength as PasswordMinLength,
  passwordRequirementsTextHtml,
  SpecialCharacters as PasswordSpecialCharacters,
} from '@app/libs/password.lib';
import { User } from '@app/models';
import { FeedCountsObservableService } from '@app/routes/main/services';
import {
  GlobalUserCategoriesModalComponent,
  openModal as openGlobalUserCategoriesModal,
} from '@app/routes/main/components/profile/global-user-categories-modal/global-user-categories-modal.component';

type UserImpl = Required<
  Pick<User, 'email' | 'hasGoogleLogin' | 'hasFacebookLogin'>
>;

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
  numberOfUnreadFeedEntries$ = this.feedCountsObservableService.feedCounts$.pipe(
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
    private feedService: FeedService,
    private feedEntryService: FeedEntryService,
    private userService: UserService,
    private opmlService: OPMLService,
    private feedCountsObservableService: FeedCountsObservableService,
    private httpErrorService: HttpErrorService,
    private gAuthService: GAuthService,
    private fbAuthService: FBAuthService,
    private appAlertsService: AppAlertsService,
  ) {
    this.isDownloadOPMLButtonDisabled = window.Blob === undefined;
  }

  ngOnInit() {
    forkJoin([
      this.userService
        .get({
          fields: ['email', 'hasGoogleLogin', 'hasFacebookLogin'],
        })
        .pipe(map(response => response as UserImpl)),
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
      this.feedEntryService
        .query({
          returnObjects: false,
          returnTotalCount: true,
          search: 'isRead:"true"',
        })
        .pipe(
          map(response => {
            if (response.totalCount !== undefined) {
              return response.totalCount;
            }
            throw new Error('malformed response');
          }),
        ),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([user, feedsCount, readFeedEntriesCount]) => {
          this.zone.run(() => {
            this.email = user.email;

            this.hasGoogleLogin = user.hasGoogleLogin;
            this.hasFacebookLogin = user.hasFacebookLogin;

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
          if (user !== null) {
            this.handleFacebookUser(user);
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

  private handleGoogleUser(user: gapi.auth2.GoogleUser) {
    this.userService
      .update({
        google: {
          token: user.getAuthResponse().id_token,
        },
      })
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

  private handleFacebookUser(user: fb.AuthResponse) {
    this.userService
      .update({
        facebook: {
          token: user.accessToken,
        },
      })
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

  unlinkGoogle() {
    this.gAuthService.signOut();

    this.hasGoogleLogin = false;

    this.userService
      .update({
        google: null,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        error: error => {
          this.httpErrorService.handleError(error);

          this.zone.run(() => {
            this.hasGoogleLogin = true;
          });
        },
      });
  }

  unlinkFacebook() {
    this.fbAuthService.signOut();

    this.hasFacebookLogin = false;

    this.userService
      .update({
        facebook: null,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        error: error => {
          this.httpErrorService.handleError(error);

          this.zone.run(() => {
            this.hasFacebookLogin = true;
          });
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

    const updateUserBody: UpdateUserBody = {};

    if (this.profileDetailsForm.controls['email']?.dirty) {
      updateUserBody.email = this.email;
    }

    if (
      this.profileDetailsForm.controls['oldPassword']?.dirty &&
      this.profileDetailsForm.controls['newPassword']?.dirty &&
      this.profileDetailsForm.controls['newPasswordCheck']?.dirty
    ) {
      updateUserBody.my = {
        password: {
          old: this.oldPassword,
          new: this.newPassword,
        },
      };
    }

    this.state = State.IsSaving;

    this.userService
      .update(updateUserBody)
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

    await openGlobalUserCategoriesModal(this.globalUserCategoriesModal);
  }
}
