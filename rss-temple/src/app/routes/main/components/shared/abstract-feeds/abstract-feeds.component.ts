import { OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';

import { Subject, fromEvent } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import * as dayjs from 'dayjs';

import { HttpErrorService } from '@app/services';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';
import { InViewportEvent } from '@app/directives/inviewport.directive';
import { FeedEntry, Feed } from '@app/models';
import { Sort } from '@app/services/data/sort.interface';
import { FeedEntryService } from '@app/services/data';
import { QueryOptions } from '@app/services/data/query.interface';
import { Field, SortField } from '@app/services/data/feedentry.service';

export const DEFAULT_COUNT = 10;

export interface FeedImpl extends Feed {
  uuid: string;
}

export interface FeedEntryImpl extends FeedEntry {
  uuid: string;
  url: string;
  title: string;
  content: string;
  isRead: boolean;
  isFavorite: boolean;
  authorName: string | null;
  publishedAt: dayjs.Dayjs;
  feedUuid: string;
}

export abstract class AbstractFeedsComponent implements OnInit, OnDestroy {
  feedEntries: FeedEntryImpl[] = [];

  isLoadingMore = false;

  private focusedFeedEntryView: FeedEntryViewComponent | null = null;

  protected readonly unsubscribe$ = new Subject<void>();

  constructor(
    protected zone: NgZone,
    protected changeDetectorRef: ChangeDetectorRef,
    protected feedEntryService: FeedEntryService,
    protected httpErrorService: HttpErrorService,
  ) {}

  ngOnInit() {
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

  abstract get feeds(): FeedImpl[];

  protected feedEntryQueryOptions(
    count: number,
    skip?: number,
  ): QueryOptions<Field, SortField> {
    return {
      fields: [
        'uuid',
        'url',
        'title',
        'content',
        'isRead',
        'isFavorite',
        'authorName',
        'publishedAt',
        'feedUuid',
      ],
      returnTotalCount: false,
      count,
      skip,
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

  protected getFeedEntries(count = DEFAULT_COUNT, skip?: number) {
    if (this.feeds.length > 0) {
      this.feedEntryService
        .query(this.feedEntryQueryOptions(count, skip))
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

  onEntryEnteredViewport(
    event: InViewportEvent,
    feedEntryView: FeedEntryViewComponent,
  ) {
    if (event.isInViewport) {
      this.focusedFeedEntryView = feedEntryView;

      feedEntryView.autoRead();
    }
  }

  onEntryClicked(_: MouseEvent, feedEntryView: FeedEntryViewComponent) {
    this.focusedFeedEntryView = feedEntryView;

    feedEntryView.autoRead();
  }

  private handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'm') {
      const focusedFeedEntry = this.focusedFeedEntryView;
      if (focusedFeedEntry !== null) {
        const feedEntry = focusedFeedEntry.feedEntry;
        if (feedEntry === undefined) {
          return;
        }

        if (!feedEntry.isRead) {
          this.feedEntryService
            .read(feedEntry)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: () => {
                feedEntry.isRead = true;
                this.changeDetectorRef.detectChanges();
              },
              error: error => {
                this.httpErrorService.handleError(error);
              },
            });
        } else {
          this.feedEntryService
            .unread(feedEntry)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: () => {
                feedEntry.isRead = false;
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
