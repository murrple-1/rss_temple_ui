/* eslint-disable @angular-eslint/directive-class-suffix */
import {
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  Directive,
} from '@angular/core';

import { Subject, fromEvent } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { HttpErrorService } from '@app/services';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';
import { InViewportEvent } from '@app/directives/inviewport.directive';
import { FeedEntry, Feed } from '@app/models';
import { Sort } from '@app/services/data/sort.interface';
import { FeedEntryService } from '@app/services/data';
import { QueryOptions } from '@app/services/data/query.interface';
import { Field, SortField } from '@app/services/data/feedentry.service';

export const DEFAULT_COUNT = 10;

export type FeedImpl = Required<Pick<Feed, 'uuid'>>;
export type FeedEntryImpl = Required<
  Pick<
    FeedEntry,
    | 'uuid'
    | 'url'
    | 'title'
    | 'content'
    | 'isRead'
    | 'isFavorite'
    | 'authorName'
    | 'publishedAt'
    | 'feedUuid'
  >
>;

@Directive()
export abstract class AbstractFeedsComponent implements OnInit, OnDestroy {
  feedEntries: FeedEntryImpl[] = [];

  isLoadingMore = false;

  protected count = DEFAULT_COUNT;

  private focusedFeedEntryView: FeedEntryViewComponent | null = null;

  protected readonly unsubscribe$ = new Subject<void>();

  abstract get feeds(): FeedImpl[];

  constructor(
    protected zone: NgZone,
    protected changeDetectorRef: ChangeDetectorRef,
    protected feedEntryService: FeedEntryService,
    protected httpErrorService: HttpErrorService,
  ) {}

  protected static feedEntryQueryOptions(
    feeds: FeedImpl[],
    count: number,
    skip?: number,
  ): QueryOptions<Field, SortField> {
    let search: string;
    if (feeds.length < 1) {
      search = 'isRead:"false"';
    } else {
      search = `feedUuid:"${feeds
        .map(feed => feed.uuid)
        .join(',')}" and isRead:"false"`;
    }

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
      search,
      sort: new Sort([
        ['createdAt', 'DESC'],
        ['publishedAt', 'DESC'],
        ['updatedAt', 'DESC'],
      ]),
    };
  }

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

  protected getFeedEntries(skip?: number) {
    return this.feedEntryService
      .query(
        AbstractFeedsComponent.feedEntryQueryOptions(
          this.feeds,
          this.count,
          skip,
        ),
      )
      .pipe(
        map(feedEntries => {
          if (feedEntries.objects !== undefined) {
            return feedEntries.objects as FeedEntryImpl[];
          }
          throw new Error('malformed response');
        }),
      );
  }

  onApproachingBottom() {
    if (this.feedEntries && this.feedEntries.length > 0) {
      this.isLoadingMore = true;

      this.getFeedEntries(this.feedEntries.length)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: feedEntries => {
            this.zone.run(() => {
              this.feedEntries = this.feedEntries.concat(...feedEntries);

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
            .read(feedEntry.uuid)
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
            .unread(feedEntry.uuid)
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
