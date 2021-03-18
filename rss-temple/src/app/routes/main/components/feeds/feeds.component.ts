import { Component, NgZone, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { takeUntil, map } from 'rxjs/operators';

import { format } from 'date-fns';

import { FeedService, FeedEntryService } from '@app/services/data';
import { FeedObservableService } from '@app/routes/main/services';
import {
  AbstractFeedsComponent,
  DEFAULT_COUNT,
  FeedImpl as BaseFeedImpl,
  FeedEntryImpl as BaseFeedEntryImpl,
} from '@app/routes/main/components/shared/abstract-feeds/abstract-feeds.component';
import { HttpErrorService } from '@app/services';
import { Feed } from '@app/models';

type FeedImpl = BaseFeedImpl &
  Required<Pick<Feed, 'homeUrl' | 'calculatedTitle'>>;
type FeedEntryImpl = BaseFeedEntryImpl;

@Component({
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss'],
})
export class FeedsComponent extends AbstractFeedsComponent implements OnInit {
  feeds: FeedImpl[] = [];

  favoritesOnly = false;

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
          paramMap.get('count') ?? DEFAULT_COUNT.toString(10),
          10,
        );
        this.favoritesOnly = paramMap.get('favorites') === 'true';

        this._getFeedEntries();
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

          this._getFeedEntries();
        },
      });

    this.feedObservableService.feedRemoved
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feed => {
          this.feeds = this.feeds.filter(f => f.uuid !== feed.uuid);

          this._getFeedEntries();
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
        fields: ['uuid', 'calculatedTitle', 'homeUrl'],
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

          this._getFeedEntries();
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  protected feedEntryQueryOptions_search(_feeds: FeedImpl[]) {
    const searchParts: string[] = [];
    if (this.favoritesOnly) {
      searchParts.push('(isFavorite:"true")');
    } else {
      searchParts.push('(isRead:"false")');
    }

    if (this.startTime !== null) {
      searchParts.push(
        `(publishedAt:"|${format(this.startTime, 'yyyy-MM-dd HH:mm:ss')}")`,
      );
    }

    return searchParts.join(' and ');
  }

  private _getFeedEntries() {
    this.getFeedEntries()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feedEntries => {
          if (this.startTime === null) {
            this.startTime = feedEntries[0]?.publishedAt ?? null;
          }

          this.zone.run(() => {
            this.feedEntries = feedEntries;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  findFeed(feedEntry: FeedEntryImpl) {
    const feed = this.feeds.find(_feed => _feed.uuid === feedEntry.feedUuid);
    return feed;
  }

  feedAdded(feed: FeedImpl) {
    this.feeds.push(feed);

    this._getFeedEntries();
  }

  opmlUploaded() {
    this.getFeeds();
  }
}
