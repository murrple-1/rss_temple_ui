import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  FeedService,
  FeedEntryService,
  UserCategoryService,
} from '@app/_services/data';
import { Feed, FeedEntry, UserCategory } from '@app/_models';
import { HttpErrorService } from '@app/_services';

@Component({
  templateUrl: 'feed.component.html',
  styleUrls: ['feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {
  feed: Feed | null = null;
  feedEntries: FeedEntry[] = [];
  userCategories: UserCategory[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private zone: NgZone,
    private feedService: FeedService,
    private feedEntryService: FeedEntryService,
    private userCategoryService: UserCategoryService,
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
        fields: ['uuid', 'title', 'subscribed', 'userCategoryUuids'],
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feed => {
          feed.feedUrl = url;

          const feedEntryObservable = this.feedEntryService.query({
            fields: ['uuid', 'url', 'title', 'content', 'isRead', 'isFavorite'],
            returnTotalCount: false,
            count: count,
            search: `feedUuid:"${feed.uuid}"`,
            sort: 'createdAt:DESC,publishedAt:DESC,updatedAt:DESC',
          });

          if (
            feed.userCategoryUuids !== undefined &&
            feed.userCategoryUuids.length > 0
          ) {
            zip(
              feedEntryObservable,
              this.userCategoryService.queryAll({
                fields: ['text'],
                returnTotalCount: false,
                search: `uuid:"${feed.userCategoryUuids.join('|')}"`,
                sort: 'text:ASC',
              }),
            )
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe({
                next: ([feedEntries, userCategories]) => {
                  this.zone.run(() => {
                    if (
                      feedEntries.objects !== undefined &&
                      userCategories.objects !== undefined
                    ) {
                      this.feed = feed;
                      this.feedEntries = feedEntries.objects;
                      this.userCategories = userCategories.objects;
                    }
                  });
                },
                error: error => {
                  this.httpErrorService.handleError(error);
                },
              });
          } else {
            feedEntryObservable.pipe(takeUntil(this.unsubscribe$)).subscribe({
              next: feedEntries => {
                this.zone.run(() => {
                  if (feedEntries.objects !== undefined) {
                    this.feed = feed;
                    this.feedEntries = feedEntries.objects;
                    this.userCategories = [];
                  }
                });
              },
              error: error => {
                this.httpErrorService.handleError(error);
              },
            });
          }
        },
        error: error => {
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
          error: error => {
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
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }
}
