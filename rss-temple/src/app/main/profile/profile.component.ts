import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeedService, FeedEntryService } from '@app/_services/data';
import { HttpErrorService } from '@app/_services';

@Component({
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  numberOfFeeds = 0;
  numberOfReadFeedEntries = 0;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private feedService: FeedService,
    private feedEntryService: FeedEntryService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnInit() {
    this.feedService
      .some({
        returnObjects: false,
        returnTotalCount: true,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: value => {
          this.zone.run(() => {
            this.numberOfFeeds = value.totalCount;
          });
        },
        error: (error: HttpErrorResponse) => {
          this.httpErrorService.handleError(error);
        },
      });

    this.feedEntryService
      .some({
        returnObjects: false,
        returnTotalCount: true,
        search: 'isRead:"true"',
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: value => {
          this.zone.run(() => {
            this.numberOfReadFeedEntries = value.totalCount;
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

  save() {
    console.log('saved!');
  }
}
