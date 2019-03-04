import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  FeedService,
  FeedEntryService,
  UserService,
} from '@app/_services/data';
import { HttpErrorService } from '@app/_services';

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
      oldPassword: [''],
      newPassword: [''],
      newPasswordCheck: [''],
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
            this.profileForm.controls.email.setValue(user.email);
            this.hasGoogleLogin = user.hasGoogleLogin!;
            this.hasFacebookLogin = user.hasFacebookLogin!;

            this.numberOfFeeds = responses[1].totalCount!;
            this.numberOfReadFeedEntries = responses[2].totalCount!;
          });
        },
        error: (error: HttpErrorResponse) => {
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
    console.log('saved!');
  }
}
