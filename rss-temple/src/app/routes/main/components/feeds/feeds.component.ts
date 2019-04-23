import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeedService, FeedEntryService } from '@app/services/data';
import { QueryOptions } from '@app/services/data/query.interface';
import { Field } from '@app/services/data/feedentry.service';
import { Feed, FeedEntry } from '@app/models';
import { HttpErrorService } from '@app/services';
import { FeedObservableService } from '@app/routes/main/services';
import { InViewportEvent } from '@app/directives/inviewport.directive';

@Component({
  templateUrl: 'feeds.component.html',
  styleUrls: ['feeds.component.scss'],
})
export class FeedsComponent implements OnInit, OnDestroy {
  private feeds: Feed[] = [];
  feedEntries: FeedEntry[] = [];

  isLoadingMore = false;

  private count = 15;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private zone: NgZone,
    private feedService: FeedService,
    private feedObservableService: FeedObservableService,
    private feedEntryService: FeedEntryService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: paramMap => {
        this.count = parseInt(
          paramMap.get('count') || this.count.toString(),
          10,
        );

        this.getFeedEntries();
      },
    });

    this.getFeeds();

    this.feedObservableService.feedAdded
      .pipe(takeUntil(this.unsubscribe$))
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
        next: () => {
          this.getFeeds();
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getFeeds() {
    this.feedService
      .queryAll({
        fields: ['uuid'],
        search: 'subscribed:"true"',
        returnTotalCount: false,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feeds => {
          if (feeds.objects !== undefined) {
            this.feeds = feeds.objects;

            this.getFeedEntries();
          }
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  private queryOptions(skip?: number): QueryOptions<Field> {
    return {
      fields: ['uuid', 'url', 'title', 'content', 'isRead'],
      returnTotalCount: false,
      count: this.count,
      skip: skip,
      search: `feedUuid:"${this.feeds
        .map(feed => feed.uuid)
        .join('|')}" and isRead:"false"`,
      sort: 'createdAt:DESC,publishedAt:DESC,updatedAt:DESC',
    };
  }

  private getFeedEntries() {
    if (this.feeds.length > 0) {
      this.feedEntryService
        .query(this.queryOptions())
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: feedEntries => {
            if (feedEntries.objects !== undefined) {
              this.feedEntries = feedEntries.objects;
            }
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }

  feedAdded(feed: Feed) {
    this.feeds = this.feeds.concat(feed);

    this.getFeedEntries();
  }

  opmlUploaded() {
    this.getFeeds();
  }

  onApproachingBottom() {
    if (this.feedEntries && this.feedEntries.length > 0) {
      this.isLoadingMore = true;

      this.feedEntryService
        .query(this.queryOptions(this.feedEntries.length))
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: feedEntries => {
            if (feedEntries.objects !== undefined) {
              this.feedEntries = this.feedEntries.concat(feedEntries.objects);
            }

            this.zone.run(() => {
              this.isLoadingMore = false;
            });
          },
          error: error => {
            this.zone.run(() => {
              this.isLoadingMore = false;
            });

            this.httpErrorService.handleError(error);
          },
        });
    }
  }

  onEntryEnteredViewport(event: InViewportEvent) {
    if (event.isInViewport) {
      console.log(event);
    }
  }
}
