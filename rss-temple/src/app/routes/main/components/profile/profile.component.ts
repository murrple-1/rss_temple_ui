import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject, zip } from 'rxjs';
import { takeUntil, skip, map } from 'rxjs/operators';

import { FeedService, FeedEntryService, UserService } from '@app/services/data';
import {
  HttpErrorService,
  GAuthService,
  FBAuthService,
  AppAlertsService,
} from '@app/services';
import { UpdateUserBody } from '@app/services/data/user.service';
import {
  MinLength as PasswordMinLength,
  passwordRequirementsText,
  SpecialCharacters as PasswordSpecialCharacters,
} from '@app/libs/password.lib';
import { User } from '@app/models';

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

  // TODO hasn't been hooked up yet
  isPasswordChanging = false;

  fieldsChanged = new Set<string>();

  hasGoogleLogin = false;
  hasFacebookLogin = false;

  numberOfFeeds = 0;
  numberOfReadFeedEntries = 0;

  gLoaded = false;
  fbLoaded = false;

  readonly passwordHelperText = passwordRequirementsText('en');
  readonly passwordMinLength = PasswordMinLength;
  readonly passwordSpecialCharacters = PasswordSpecialCharacters.join('');

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private feedService: FeedService,
    private feedEntryService: FeedEntryService,
    private userService: UserService,
    private httpErrorService: HttpErrorService,
    private gAuthService: GAuthService,
    private fbAuthService: FBAuthService,
    private appAlertsService: AppAlertsService,
  ) {}

  ngOnInit() {
    zip(
      this.userService
        .get({
          fields: ['email', 'hasGoogleLogin', 'hasFacebookLogin'],
        })
        .pipe(map(response => response as UserImpl)),
      this.feedService
        .query({
          returnObjects: false,
          returnTotalCount: true,
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
    )
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

  linkGoogle() {
    this.gAuthService.signIn();
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

  linkFacebook() {
    this.fbAuthService.signIn();
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
    if (this.fieldsChanged.size < 1) {
      return;
    }

    // TODO check error state

    const updateUserBody: UpdateUserBody = {};

    if (this.fieldsChanged.has('email')) {
      updateUserBody.email = this.email;
    }

    if (this.fieldsChanged.has('password')) {
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

          this.fieldsChanged.clear();

          this.zone.run(() => {
            this.state = State.SaveSuccess;
          });
        },
        error: error => {
          if (error instanceof HttpErrorResponse && error.status === 400) {
            this.appAlertsService.appAlertDescriptor$.next({
              autoCloseInterval: 5000,
              canClose: true,
              text: 'Profile failed to save',
              type: 'danger',
            });
          } else {
            this.httpErrorService.handleError(error);
          }

          this.zone.run(() => {
            this.state = State.SaveError;
          });
        },
      });
  }
}
