/* eslint-disable @angular-eslint/directive-class-suffix */
import {
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  Directive,
  HostListener,
  QueryList,
  ElementRef,
} from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { takeUntil, map, mergeMap, tap } from 'rxjs/operators';

import { HttpErrorService } from '@app/services';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';
import { InViewportEvent } from '@app/routes/main/directives/inviewport.directive';
import { FeedEntry, Feed } from '@app/models';
import { Sort } from '@app/services/data/sort.interface';
import { FeedEntryService } from '@app/services/data';
import { Field, SortField } from '@app/services/data/feedentry.service';
import {
  CreateStableQueryOptions,
  StableQueryOptions,
} from '@app/services/data/stablequery.interface';
import { Objects } from '@app/services/data/objects';

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

enum LoadingState {
  IsLoading,
  IsNotLoading,
  NoMoreToLoad,
}

@Directive()
export abstract class AbstractFeedsComponent implements OnDestroy {
  feedEntries: FeedEntryImpl[] = [];

  loadingState = LoadingState.IsNotLoading;
  readonly LoadingState = LoadingState;

  protected count = DEFAULT_COUNT;

  focusedFeedEntryView: FeedEntryViewComponent | null = null;

  protected stableQueryToken: string | null = null;

  abstract get feeds(): FeedImpl[];

  protected abstract get feedEntryViews():
    | QueryList<FeedEntryViewComponent>
    | undefined;
  protected abstract get feedEntryViewsScollContainer():
    | ElementRef<HTMLElement>
    | undefined;

  protected readonly unsubscribe$ = new Subject<void>();

  constructor(
    protected zone: NgZone,
    protected changeDetectorRef: ChangeDetectorRef,
    protected feedEntryService: FeedEntryService,
    protected httpErrorService: HttpErrorService,
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  protected feedEntryCreateStableQueryOptions(
    feeds: FeedImpl[],
  ): CreateStableQueryOptions<SortField> {
    return {
      search: this.feedEntryCreateStableQueryOptions_search(feeds),
      sort: this.feedEntryCreateStableQueryOptions_sort(),
    };
  }

  protected feedEntryStableQueryOptions(
    token: string,
    count: number,
    skip?: number,
  ): StableQueryOptions<Field> {
    return {
      token,
      count,
      skip,
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
    };
  }

  protected abstract feedEntryCreateStableQueryOptions_search(
    feeds: FeedImpl[],
  ): string | undefined;

  protected feedEntryCreateStableQueryOptions_sort() {
    return new Sort([
      ['publishedAt', 'DESC'],
      ['createdAt', 'DESC'],
      ['updatedAt', 'DESC'],
    ]);
  }

  protected getFeedEntries(skip?: number) {
    let feedEntriesObservale: Observable<Objects<FeedEntry>>;
    if (this.stableQueryToken === null) {
      feedEntriesObservale = this.feedEntryService
        .createStableQuery(this.feedEntryCreateStableQueryOptions(this.feeds))
        .pipe(
          tap(token => {
            this.stableQueryToken = token;
          }),
          mergeMap(token =>
            this.feedEntryService.stableQuery(
              this.feedEntryStableQueryOptions(token, this.count, skip),
            ),
          ),
        );
    } else {
      feedEntriesObservale = this.feedEntryService.stableQuery(
        this.feedEntryStableQueryOptions(
          this.stableQueryToken,
          this.count,
          skip,
        ),
      );
    }

    return feedEntriesObservale.pipe(
      map(feedEntries => {
        if (feedEntries.objects !== undefined) {
          return feedEntries.objects as FeedEntryImpl[];
        }
        throw new Error('malformed response');
      }),
    );
  }

  onApproachingBottom() {
    if (this.feedEntries.length > 0) {
      this.loadingState = LoadingState.IsLoading;

      this.getFeedEntries(this.feedEntries.length)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: feedEntries => {
            this.zone.run(() => {
              if (feedEntries.length > 0) {
                this.feedEntries = this.feedEntries.concat(...feedEntries);
                this.loadingState = LoadingState.IsNotLoading;
              } else {
                this.loadingState = LoadingState.NoMoreToLoad;
              }
            });
          },
          error: error => {
            this.zone.run(() => {
              this.loadingState = LoadingState.IsNotLoading;
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

  protected reload() {
    this.loadingState = LoadingState.IsNotLoading;
    this.focusedFeedEntryView = null;
    this.stableQueryToken = null;
    this.feedEntries = [];
  }

  private moveFocus(
    indexFn: (currentIndex: number, listLength: number) => number,
    scrollToTopFn: (
      entryBoundingClientRect: DOMRect,
      scrollContainerBoundingClientRect: DOMRect,
      scrollContainerScrollTop: number,
    ) => number,
  ) {
    if (this.feedEntryViews === undefined) {
      throw new Error('feedEntryViews undefined');
    }

    if (this.feedEntryViewsScollContainer === undefined) {
      throw new Error('feedEntryViewsScrollContainer undefined');
    }

    const feedEntryViews = this.feedEntryViews.toArray();
    let newIndex: number;
    if (this.focusedFeedEntryView !== null) {
      const currentIndex = feedEntryViews.indexOf(this.focusedFeedEntryView);
      if (currentIndex >= 0) {
        newIndex = indexFn(currentIndex, feedEntryViews.length);
      } else {
        newIndex = 0;
      }
    } else {
      newIndex = 0;
    }

    this.focusedFeedEntryView = feedEntryViews[newIndex] ?? null;
    if (this.focusedFeedEntryView !== null) {
      this.focusedFeedEntryView.autoRead();

      const containerBoundingRect = this.feedEntryViewsScollContainer.nativeElement.getBoundingClientRect();
      const entryBoundingRect = this.focusedFeedEntryView.elementRef.nativeElement.getBoundingClientRect();
      if (
        !AbstractFeedsComponent.rectContainsRect(
          containerBoundingRect,
          entryBoundingRect,
        )
      ) {
        const top = scrollToTopFn(
          entryBoundingRect,
          containerBoundingRect,
          this.feedEntryViewsScollContainer.nativeElement.scrollTop,
        );
        if (top >= 0) {
          this.feedEntryViewsScollContainer.nativeElement.scrollTo({
            top,
          });
        }
      }
    }
  }

  private static scrollToTopUp(
    entryBoundingClientRect: DOMRect,
    scrollContainerBoundingClientRect: DOMRect,
    scrollContainerScrollTop: number,
  ) {
    return AbstractFeedsComponent.topAlignTop(
      entryBoundingClientRect,
      scrollContainerBoundingClientRect,
      scrollContainerScrollTop,
    );
  }

  private static scrollToTopDown(
    entryBoundingClientRect: DOMRect,
    scrollContainerBoundingClientRect: DOMRect,
    scrollContainerScrollTop: number,
  ) {
    if (
      entryBoundingClientRect.height <= scrollContainerBoundingClientRect.height
    ) {
      return AbstractFeedsComponent.bottomAlignTop(
        entryBoundingClientRect,
        scrollContainerBoundingClientRect,
        scrollContainerScrollTop,
      );
    } else {
      return AbstractFeedsComponent.topAlignTop(
        entryBoundingClientRect,
        scrollContainerBoundingClientRect,
        scrollContainerScrollTop,
      );
    }
  }

  private static topAlignTop(
    entryBoundingClientRect: DOMRect,
    scrollContainerBoundingClientRect: DOMRect,
    scrollContainerScrollTop: number,
  ) {
    return (
      entryBoundingClientRect.top +
      scrollContainerScrollTop -
      scrollContainerBoundingClientRect.top -
      8
    );
  }

  private static bottomAlignTop(
    entryBoundingClientRect: DOMRect,
    scrollContainerBoundingClientRect: DOMRect,
    scrollContainerScrollTop: number,
  ) {
    return (
      entryBoundingClientRect.top +
      scrollContainerScrollTop -
      (scrollContainerBoundingClientRect.top +
        scrollContainerBoundingClientRect.height) +
      entryBoundingClientRect.height +
      8
    );
  }

  private static rectContainsRect(outerRect: DOMRect, innerRect: DOMRect) {
    return (
      outerRect.top <= innerRect.top &&
      outerRect.bottom >= innerRect.bottom &&
      outerRect.left <= innerRect.left &&
      outerRect.right >= innerRect.right
    );
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    switch (event.key) {
      case 'm': {
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
        break;
      }
      case 'j': {
        this.moveFocus((currentIndex: number, listLength: number) => {
          let newIndex = currentIndex + 1;
          if (newIndex > listLength - 1) {
            newIndex = currentIndex;
          }
          return newIndex;
        }, AbstractFeedsComponent.scrollToTopDown);
        break;
      }
      case 'k': {
        this.moveFocus((currentIndex: number, _listLength: number) => {
          let newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = 0;
          }
          return newIndex;
        }, AbstractFeedsComponent.scrollToTopUp);
        break;
      }
      case 'r': {
        this.reload();
        break;
      }
    }
  }
}
