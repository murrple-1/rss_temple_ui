import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { takeUntil, map } from 'rxjs/operators';

import { FeedService, FeedEntryService } from '@app/services/data';
import { FeedObservableService } from '@app/routes/main/services';
import {
  AbstractFeedsComponent,
  DEFAULT_COUNT,
  FeedImpl,
} from '@app/routes/main/components/shared/abstract-feeds/abstract-feeds.component';
import { HttpErrorService } from '@app/services';

@Component({
  templateUrl: 'feeds.component.html',
  styleUrls: ['feeds.component.scss'],
})
export class FeedsComponent extends AbstractFeedsComponent {
  feeds: FeedImpl[] = [];

  private count = DEFAULT_COUNT;

  constructor(
    private route: ActivatedRoute,
    private feedService: FeedService,
    private feedObservableService: FeedObservableService,

    zone: NgZone,
    changeDetectorRef: ChangeDetectorRef,
    feedEntryService: FeedEntryService,
    httpErrorService: HttpErrorService,
  ) {
    super(zone, changeDetectorRef, feedEntryService, httpErrorService);
  }

  ngOnInit() {
    super.ngOnInit();

    this.route.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: paramMap => {
        this.count = parseInt(
          paramMap.get('count') || this.count.toString(),
          DEFAULT_COUNT,
        );

        this.getFeedEntries();
      },
    });

    this.getFeeds();

    this.feedObservableService.feedAdded
      .pipe(
        takeUntil(this.unsubscribe$),
        map(feed => feed as FeedImpl),
      )
      .subscribe({
        next: feed => {
          this.feeds.push(feed);

          this.getFeedEntries();
        },
      });

    this.feedObservableService.feedRemoved
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feed => {
          this.feeds = this.feeds.filter(f => {
            if (feed.uuid !== undefined) {
              return f.uuid !== feed.uuid;
            } else {
              return true;
            }
          });

          this.getFeedEntries();
        },
      });

    this.feedObservableService.feedsChanged
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: this.getFeeds.bind(this),
      });
  }

  private getFeeds() {
    this.feedService
      .queryAll({
        fields: ['uuid'],
        search: 'subscribed:"true"',
        returnTotalCount: false,
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        map(feeds => {
          if (feeds.objects !== undefined) {
            return feeds.objects as FeedImpl[];
          }
          throw new Error('malformed response');
        }),
      )
      .subscribe({
        next: feeds => {
          this.feeds = feeds;

          this.getFeedEntries();
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  feedAdded(feed: FeedImpl) {
    this.feeds.push(feed);

    this.changeDetectorRef.detectChanges();

    this.getFeedEntries();
  }

  opmlUploaded() {
    this.getFeeds();
  }
}
