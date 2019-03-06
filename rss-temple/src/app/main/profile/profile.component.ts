import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  FeedService,
  FeedEntryService,
  UserService,
} from '@app/_services/data';
import { HttpErrorService } from '@app/_services';
import { UpdateUserBody } from '@app/_services/data/user.service';

@Component({
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;

  hasGoogleLogin = false;
  hasFacebookLogin = false;

  numberOfFeeds = 0;
  numberOfReadFeedEntries = 0;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private zone: NgZone,
    private feedService: FeedService,
    private feedEntryService: FeedEntryService,
    private userService: UserService,
    private httpErrorService: HttpErrorService,
  ) {
    this.profileForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      oldPassword: ['', [Validators.minLength(6)]],
      newPassword: ['', [Validators.minLength(6)]],
      newPasswordCheck: ['', [Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    zip(
      this.userService.get({
        fields: ['email', 'hasGoogleLogin', 'hasFacebookLogin'],
      }),
      this.feedService.some({
        returnObjects: false,
        returnTotalCount: true,
      }),
      this.feedEntryService.some({
        returnObjects: false,
        returnTotalCount: true,
        search: 'isRead:"true"',
      }),
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: responses => {
          this.zone.run(() => {
            const user = responses[0];
            if (user.email !== undefined) {
              this.profileForm.controls.email.setValue(user.email);
              this.profileForm.controls.email.markAsPristine();
            }

            if (user.hasGoogleLogin !== undefined) {
              this.hasGoogleLogin = user.hasGoogleLogin;
            }

            if (user.hasFacebookLogin !== undefined) {
              this.hasFacebookLogin = user.hasFacebookLogin;
            }

            if (responses[1].totalCount !== undefined) {
              this.numberOfFeeds = responses[1].totalCount;
            }

            if (responses[2].totalCount) {
              this.numberOfReadFeedEntries = responses[2].totalCount;
            }
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  linkGoogle() {
    console.log('google linked');
  }

  linkFacebook() {
    console.log('facebook linked');
  }

  unlinkGoogle() {
    console.log('google linked');
  }

  unlinkFacebook() {
    console.log('facebook linked');
  }

  save() {
    let hasUpdates = false;
    const updateUserBody: UpdateUserBody = {};

    const emailControl = this.profileForm.controls.email;
    if (!emailControl.errors && emailControl.dirty) {
      updateUserBody.email = emailControl.value as string;
      hasUpdates = true;
    }

    const oldPasswordControl = this.profileForm.controls.oldPassword;
    if (
      oldPasswordControl.dirty &&
      (oldPasswordControl.value as string).length > 0
    ) {
      const newPasswordControl = this.profileForm.controls.newPassword;
      const newPasswordCheckControl = this.profileForm.controls
        .newPasswordCheck;

      if (
        newPasswordControl.dirty &&
        (newPasswordControl.value as string).length > 0
      ) {
        if (newPasswordControl.value === newPasswordCheckControl.value) {
          updateUserBody.my = {
            password: {
              old: oldPasswordControl.value as string,
              new: newPasswordControl.value as string,
            },
          };
          hasUpdates = true;
        } else {
          // TODO new passwords don't match
        }
      } else {
        // TODO no new password entered
      }
    }

    if (hasUpdates) {
      this.userService
        .update(updateUserBody)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            // TODO
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }
}
