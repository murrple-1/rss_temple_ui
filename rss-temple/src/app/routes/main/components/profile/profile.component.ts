import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject, zip } from 'rxjs';
import { takeUntil, skip, map } from 'rxjs/operators';

import { FeedService, FeedEntryService, UserService } from '@app/services/data';
import {
  HttpErrorService,
  GAuthService,
  FBAuthService,
  AlertService,
} from '@app/services';
import { UpdateUserBody } from '@app/services/data/user.service';
import {
  isValidPassword,
  doPasswordsMatch,
  passwordRequirementsText,
} from '@app/libs/password.lib';
import { FormGroupErrors } from '@app/libs/formgrouperrors.lib';
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
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  state = State.IsLoading;
  readonly State = State;

  profileForm: FormGroup;
  profileFormErrors = new FormGroupErrors();

  hasGoogleLogin = false;
  hasFacebookLogin = false;

  numberOfFeeds = 0;
  numberOfReadFeedEntries = 0;

  gLoaded = false;
  fbLoaded = false;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private zone: NgZone,
    private feedService: FeedService,
    private feedEntryService: FeedEntryService,
    private userService: UserService,
    private httpErrorService: HttpErrorService,
    private gAuthService: GAuthService,
    private fbAuthService: FBAuthService,
    private alertService: AlertService,
  ) {
    this.profileForm = this.formBuilder.group(
      {
        email: ['', [Validators.email]],
        oldPassword: [''],
        newPassword: ['', [isValidPassword()]],
        newPasswordCheck: [''],
      },
      {
        validators: [doPasswordsMatch('newPassword', 'newPasswordCheck')],
      },
    );

    this.profileFormErrors.initializeControls(this.profileForm);
  }

  ngOnInit() {
    zip(
      this.userService.get({
        fields: ['email', 'hasGoogleLogin', 'hasFacebookLogin'],
      }),
      this.feedService.query({
        returnObjects: false,
        returnTotalCount: true,
      }),
      this.feedEntryService.query({
        returnObjects: false,
        returnTotalCount: true,
        search: 'isRead:"true"',
      }),
    )
      .pipe(
        takeUntil(this.unsubscribe$),
        map(([user, feedsObjects, feedEntriesObject]) => {
          if (
            feedsObjects.totalCount !== undefined &&
            feedEntriesObject.totalCount !== undefined
          ) {
            return [
              user as UserImpl,
              feedsObjects.totalCount,
              feedEntriesObject.totalCount,
            ] as [UserImpl, number, number];
          }
          throw new Error('malformed response');
        }),
      )
      .subscribe({
        next: ([user, feedsCount, readFeedEntriesCount]) => {
          this.zone.run(() => {
            this.profileForm.controls.email.setValue(user.email);
            this.profileForm.controls.email.markAsPristine();

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
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$),
      )
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
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$),
      )
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
    if (this.profileForm.pristine) {
      return;
    }

    this.profileFormErrors.clearErrors();
    if (this.profileForm.invalid) {
      this.state = State.SaveError;

      const errors = this.profileForm.errors;
      if (errors !== null) {
        if (errors.passwordsdonotmatch) {
          this.profileFormErrors.errors.push('Passwords do not match');
        }
      }

      const emailErrors = this.profileForm.controls.email.errors;
      if (emailErrors !== null) {
        if (emailErrors.email) {
          this.profileFormErrors.controls.email.push('Email malformed');
        }
      }

      const newPasswordErrors = this.profileForm.controls.newPassword.errors;
      if (newPasswordErrors !== null) {
        if (
          newPasswordErrors.nolowercase ||
          newPasswordErrors.nouppercase ||
          newPasswordErrors.nodigit ||
          newPasswordErrors.nospecialcharacter
        ) {
          this.profileFormErrors.controls.newPassword.push(
            passwordRequirementsText('en'),
          );
        }
      }

      return;
    }

    let hasUpdates = false;
    const updateUserBody: UpdateUserBody = {};

    const emailControl = this.profileForm.controls.email;
    if (emailControl.dirty) {
      updateUserBody.email = emailControl.value as string;
      hasUpdates = true;
    }

    const oldPasswordControl = this.profileForm.controls.oldPassword;
    const newPasswordControl = this.profileForm.controls.newPassword;
    const newPasswordCheckControl = this.profileForm.controls.newPasswordCheck;
    if (
      oldPasswordControl.dirty &&
      newPasswordControl.dirty &&
      newPasswordCheckControl.dirty
    ) {
      updateUserBody.my = {
        password: {
          old: oldPasswordControl.value as string,
          new: newPasswordControl.value as string,
        },
      };
      hasUpdates = true;
    }

    if (hasUpdates) {
      this.state = State.IsSaving;

      this.userService
        .update(updateUserBody)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.alertService.success('Profile Saved', 5000);

            this.profileForm.markAsPristine();

            this.zone.run(() => {
              this.state = State.SaveSuccess;
            });
          },
          error: error => {
            if (error instanceof HttpErrorResponse && error.status === 400) {
              this.alertService.error('Profile failed to save', 5000);
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
}
