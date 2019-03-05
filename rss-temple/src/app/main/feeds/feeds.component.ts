import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeedService, FeedEntryService } from '@app/_services/data';
import { SomeOptions } from '@app/_services/data/some.interface';
import { Field } from '@app/_services/data/feedentry.service';
import { Feed, FeedEntry } from '@app/_models';
import { HttpErrorService } from '@app/_services';
import { InViewportEvent } from '@app/_directives/inviewport.directive';

@Component({
  templateUrl: 'feeds.component.html',
  styleUrls: ['feeds.component.scss'],
})
export class FeedsComponent implements OnInit, OnDestroy {
  private feeds: Feed[] = [];
  private feedEntries: FeedEntry[] = [];

  feedEntries$ = new BehaviorSubject<FeedEntry[]>([]);

  isLoadingMore = false;

  private count = 15;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private zone: NgZone,
    private feedService: FeedService,
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
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getFeeds() {
    this.feedService
      .all({
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
        error: (error: HttpErrorResponse) => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  private someOptions(skip?: number): SomeOptions<Field> {
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
        .some(this.someOptions())
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: feedEntries => {
            if (feedEntries.objects !== undefined) {
              this.feedEntries = feedEntries.objects;
              this.feedEntries$.next(this.feedEntries);
            }
          },
          error: (error: HttpErrorResponse) => {
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
        .some(this.someOptions(this.feedEntries.length))
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: feedEntries => {
            if (feedEntries.objects !== undefined) {
              this.feedEntries = this.feedEntries.concat(feedEntries.objects);
              this.feedEntries$.next(this.feedEntries);
            }

            this.zone.run(() => {
              this.isLoadingMore = false;
            });
          },
          error: (error: HttpErrorResponse) => {
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
