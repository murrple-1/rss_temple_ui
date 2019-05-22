import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject, fromEvent } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { FeedService, FeedEntryService } from '@app/services/data';
import { QueryOptions } from '@app/services/data/query.interface';
import { Sort } from '@app/services/data/sort.interface';
import { Field, SortField } from '@app/services/data/feedentry.service';
import { Feed, FeedEntry } from '@app/models';
import { HttpErrorService } from '@app/services';
import { FeedObservableService } from '@app/routes/main/services';
import { InViewportEvent } from '@app/directives/inviewport.directive';

interface FeedImpl extends Feed {
  uuid: string;
}

interface FeedEntryImpl extends FeedEntry {
  uuid: string;
  url: string;
  title: string;
  content: string;
  isRead: boolean;
}

@Component({
  templateUrl: 'feeds.component.html',
  styleUrls: ['feeds.component.scss'],
})
export class FeedsComponent implements OnInit, OnDestroy {
  private feeds: FeedImpl[] = [];
  feedEntries: FeedEntryImpl[] = [];

  isLoadingMore = false;

  private count = 15;

  private currentFeedEntryFocus: FeedEntryImpl | null = null;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
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
        next: () => {
          this.getFeeds();
        },
      });

    fromEvent<KeyboardEvent>(document, 'keypress')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: this.handleKeyPress.bind(this),
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

  private feedEntryQueryOptions(skip?: number): QueryOptions<Field, SortField> {
    return {
      fields: ['uuid', 'url', 'title', 'content', 'isRead'],
      returnTotalCount: false,
      count: this.count,
      skip: skip,
      search: `feedUuid:"${this.feeds
        .map(feed => feed.uuid)
        .join('|')}" and isRead:"false"`,
      sort: new Sort([
        ['createdAt', 'DESC'],
        ['publishedAt', 'DESC'],
        ['updatedAt', 'DESC'],
      ]),
    };
  }

  private getFeedEntries() {
    if (this.feeds.length > 0) {
      this.feedEntryService
        .query(this.feedEntryQueryOptions())
        .pipe(
          takeUntil(this.unsubscribe$),
          map(feedEntries => {
            if (feedEntries.objects !== undefined) {
              return feedEntries.objects as FeedEntryImpl[];
            }
            throw new Error('malformed response');
          }),
        )
        .subscribe({
          next: feedEntries => {
            this.feedEntries = feedEntries;
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }

  feedAdded(feed: FeedImpl) {
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
        .query(this.feedEntryQueryOptions(this.feedEntries.length))
        .pipe(
          takeUntil(this.unsubscribe$),
          map(feedEntries => {
            if (feedEntries.objects !== undefined) {
              return feedEntries.objects as FeedEntryImpl[];
            }
            throw new Error('malformed response');
          }),
        )
        .subscribe({
          next: feedEntries => {
            this.feedEntries = this.feedEntries.concat(feedEntries);

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

  onEntryEnteredViewport(event: InViewportEvent, feedEntry: FeedEntryImpl) {
    if (event.isInViewport) {
      this.currentFeedEntryFocus = feedEntry;
    }
  }

  onEntryClicked(_: MouseEvent, feedEntry: FeedEntryImpl) {
    this.currentFeedEntryFocus = feedEntry;
  }

  private handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'm') {
      const currentFeedEntryFocus = this.currentFeedEntryFocus;
      if (currentFeedEntryFocus !== null) {
        if (!currentFeedEntryFocus.isRead) {
          this.feedEntryService
            .read(currentFeedEntryFocus)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: () => {
                currentFeedEntryFocus.isRead = true;
                this.changeDetectorRef.detectChanges();
              },
              error: error => {
                this.httpErrorService.handleError(error);
              },
            });
        } else {
          this.feedEntryService
            .unread(currentFeedEntryFocus)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: () => {
                currentFeedEntryFocus.isRead = false;
                this.changeDetectorRef.detectChanges();
              },
              error: error => {
                this.httpErrorService.handleError(error);
              },
            });
        }
      }
    }
  }
}
