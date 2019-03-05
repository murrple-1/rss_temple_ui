import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeedService } from '@app/_services/data/feed.service';
import { Feed } from '@app/_models/feed';
import { FeedEntryService } from '@app/_services/data/feedentry.service';
import { FeedEntry } from '@app/_models/feedentry';
import { HttpErrorService } from '@app/_services/httperror.service';

@Component({
  templateUrl: 'feed.component.html',
  styleUrls: ['feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {
  feed: Feed | null = null;
  feedEntries: FeedEntry[] = [];

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
        const url = paramMap.get('url');
        const count = parseInt(paramMap.get('count') || '5', 10);

        if (url) {
          this.getFeed(url, count);
        }
      },
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getFeed(url: string, count: number) {
    this.feedService
      .get(url, {
        fields: ['uuid', 'title', 'subscribed'],
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feed => {
          feed.feedUrl = url;
          this.zone.run(() => {
            this.feed = feed;
          });

          this.feedEntryService
            .some({
              fields: [
                'uuid',
                'url',
                'title',
                'content',
                'isRead',
                'isFavorite',
              ],
              returnTotalCount: false,
              count: count,
              search: `feedUuid:"${feed.uuid}"`,
              sort: 'createdAt:DESC,publishedAt:DESC,updatedAt:DESC',
            })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: feedEntries => {
                this.zone.run(() => {
                  if (feedEntries.objects !== undefined) {
                    this.feedEntries = feedEntries.objects;
                  }
                });
              },
              error: (error: HttpErrorResponse) => {
                this.httpErrorService.handleError(error);
              },
            });
        },
        error: (error: HttpErrorResponse) => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  onSubscribe() {
    if (this.feed && this.feed.feedUrl) {
      this.feedService
        .subscribe(this.feed.feedUrl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.zone.run(() => {
              if (this.feed !== null) {
                this.feed.subscribed = true;
              }
            });
          },
          error: (error: HttpErrorResponse) => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }

  onUnsubscribe() {
    if (this.feed && this.feed.feedUrl) {
      this.feedService
        .unsubscribe(this.feed.feedUrl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.zone.run(() => {
              if (this.feed !== null) {
                this.feed.subscribed = false;
              }
            });
          },
          error: (error: HttpErrorResponse) => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }
}
