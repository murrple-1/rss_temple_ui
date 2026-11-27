/* eslint-disable @angular-eslint/directive-class-suffix */
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  QueryList,
  inject,
} from '@angular/core';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { map, mergeMap, takeUntil, tap } from 'rxjs/operators';

import { alterFeedEntryContent } from '@app/libs/feed-content.lib';
import { ClassifierLabel, Feed, FeedEntry } from '@app/models';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';
import { State as FeedsFooterState } from '@app/routes/main/components/shared/feeds-footer/feeds-footer.component';
import { InViewportEvent } from '@app/routes/main/directives/inviewport.directive';
import {
  FeedEntryVoteService,
  ReadCounterService,
} from '@app/routes/main/services';
import { HttpErrorService, ModalOpenService } from '@app/services';
import { ClassifierLabelService, FeedEntryService } from '@app/services/data';
import { Field, SortField } from '@app/services/data/feedentry.service';
import { Objects } from '@app/services/data/objects';
import { Sort } from '@app/services/data/sort.interface';
import {
  CreateStableQueryOptions,
  StableQueryOptions,
} from '@app/services/data/stablequery.interface';

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
    | 'hasTopImageBeenProcessed'
    | 'topImageSrc'
    | 'isArchived'
  >
> & {
  possibleClassifierLabel: ClassifierLabel | null;
};

export enum LoadingState {
  IsLoading,
  IsNotLoading,
  NoMoreToLoad,
}

export class NoLoadError extends Error {}

@Directive()
export abstract class AbstractFeedsComponent implements OnDestroy {
  protected zone = inject(NgZone);
  protected changeDetectorRef = inject(ChangeDetectorRef);
  protected feedEntryService = inject(FeedEntryService);
  protected readCounterService = inject(ReadCounterService);
  protected classifierLabelService = inject(ClassifierLabelService);
  protected httpErrorService = inject(HttpErrorService);
  protected modalOpenService = inject(ModalOpenService);
  protected feedEntryVoteService = inject(FeedEntryVoteService);

  feedEntries: FeedEntryImpl[] = [];

  loadingState = LoadingState.IsNotLoading;
  readonly LoadingState = LoadingState;

  protected count = DEFAULT_COUNT;

  focusedFeedEntryView: FeedEntryViewComponent | null = null;

  protected stableQueryToken: string | null = null;

  // the entry that the last keyboard jump went to, and how far below the top
  // of the scroll container the jump left it. While it is still there, the
  // reader has not scrolled, so entries that the jump brought into view must
  // not be marked read or take the focus. The entry's position is compared
  // (not the container's `scrollTop`), because the browser changes `scrollTop`
  // by itself when content above the viewport changes height
  private jumpAnchor: {
    feedEntryView: FeedEntryViewComponent;
    offset: number;
  } | null = null;

  abstract get feeds(): FeedImpl[];

  protected abstract get feedEntryViews():
    | QueryList<FeedEntryViewComponent>
    | undefined;
  protected abstract get feedEntryViewsScollContainer():
    | ElementRef<HTMLElement>
    | undefined;

  get feedsFooterState() {
    switch (this.loadingState) {
      case LoadingState.IsNotLoading: {
        if (this.feedEntries.length > 0) {
          return FeedsFooterState.IsNotLoading;
        } else {
          return FeedsFooterState.Start;
        }
      }
      case LoadingState.IsLoading: {
        return FeedsFooterState.IsLoading;
      }
      case LoadingState.NoMoreToLoad: {
        if (this.feedEntries.length > 0) {
          return FeedsFooterState.HasNoMoreToLoad;
        } else {
          return FeedsFooterState.IsEmpty;
        }
      }
    }
  }

  protected readonly unsubscribe$ = new Subject<void>();

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
        'hasTopImageBeenProcessed',
        'topImageSrc',
        'isArchived',
      ],
      returnTotalCount: false,
    };
  }

  protected abstract feedEntryCreateStableQueryOptions_search(
    feeds: FeedImpl[],
  ): string | undefined;

  protected feedEntryCreateStableQueryOptions_sort():
    | Sort<SortField>
    | undefined {
    return new Sort([
      ['publishedAt', 'DESC'],
      ['createdAt', 'DESC'],
      ['updatedAt', 'DESC'],
    ]);
  }

  protected getFeedEntries(skip?: number) {
    let feedEntriesObservable: Observable<Objects<FeedEntry>>;
    if (this.stableQueryToken === null) {
      try {
        feedEntriesObservable = this.feedEntryService
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
      } catch (e: unknown) {
        if (e instanceof NoLoadError) {
          return of([]);
        } else {
          throw e;
        }
      }
    } else {
      feedEntriesObservable = this.feedEntryService.stableQuery(
        this.feedEntryStableQueryOptions(
          this.stableQueryToken,
          this.count,
          skip,
        ),
      );
    }

    return feedEntriesObservable.pipe(
      mergeMap(feedEntries => {
        if (feedEntries.objects !== undefined) {
          const feedEntryUuidsToClassify = feedEntries.objects
            .filter(fe =>
              this.feedEntryVoteService.shouldForceLabelVote(fe.uuid as string),
            )
            .map(fe => fe.uuid as string);

          return (
            feedEntryUuidsToClassify.length > 0
              ? forkJoin([
                  of(feedEntries.objects),
                  this.classifierLabelService.getAllByEntry(
                    feedEntryUuidsToClassify,
                  ),
                ])
              : of([[], {}])
          ) as Observable<[FeedEntry[], Record<string, ClassifierLabel[]>]>;
        }
        throw new Error('malformed response');
      }),
      map(([feedEntries_, classifierLabels]) => {
        const feedEntries = feedEntries_.map(fe => {
          const feImpl = fe as FeedEntryImpl;
          const classifierLabelList = classifierLabels[feImpl.uuid];
          if (classifierLabelList === undefined) {
            feImpl.possibleClassifierLabel = null;
          } else {
            feImpl.possibleClassifierLabel = classifierLabelList[0] ?? null;
          }
          return feImpl;
        });

        for (const feedEntry of feedEntries) {
          let title = feedEntry.title.trim();
          if (title.length < 1) {
            title = '[No Title]';
          }
          feedEntry.title = title;

          let authorName: string | null =
            feedEntry.authorName !== null ? feedEntry.authorName.trim() : null;
          if (authorName !== null && authorName.length < 1) {
            authorName = null;
          }
          feedEntry.authorName = authorName;

          feedEntry.content = alterFeedEntryContent(feedEntry.content);
        }

        return feedEntries;
      }),
    );
  }

  onApproachingBottom() {
    if (
      this.feedEntries.length > 0 &&
      this.loadingState !== LoadingState.IsLoading
    ) {
      this.loadingState = LoadingState.IsLoading;

      this.getFeedEntries(this.feedEntries.length)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: feedEntries => {
            this.zone.run(() => {
              if (feedEntries.length > 0) {
                this.feedEntries = [...this.feedEntries, ...feedEntries];
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
    if (this.jumpAnchor !== null) {
      const offset = this.offsetInScrollContainer(
        this.jumpAnchor.feedEntryView,
      );
      if (offset !== null && Math.abs(offset - this.jumpAnchor.offset) < 1) {
        return;
      }

      this.jumpAnchor = null;
    }

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
    this.jumpAnchor = null;
    this.stableQueryToken = null;
    this.feedEntries = [];

    // the room below the list keeps the container scrollable when the list
    // is empty, so the browser does not go back to the top by itself
    if (this.feedEntryViewsScollContainer !== undefined) {
      this.feedEntryViewsScollContainer.nativeElement.scrollTop = 0;
    }
  }

  private offsetInScrollContainer(feedEntryView: FeedEntryViewComponent) {
    if (this.feedEntryViewsScollContainer === undefined) {
      return null;
    }

    return (
      feedEntryView.elementRef.nativeElement.getBoundingClientRect().top -
      this.feedEntryViewsScollContainer.nativeElement.getBoundingClientRect()
        .top
    );
  }

  private moveFocus(
    indexFn: (currentIndex: number, listLength: number) => number,
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

      const scrollContainer = this.feedEntryViewsScollContainer.nativeElement;
      scrollContainer.scrollTo({
        top: Math.max(
          0,
          AbstractFeedsComponent.topAlignTop(
            this.focusedFeedEntryView.elementRef.nativeElement.getBoundingClientRect(),
            scrollContainer.getBoundingClientRect(),
            scrollContainer.scrollTop,
          ),
        ),
      });
      const offset = this.offsetInScrollContainer(this.focusedFeedEntryView);
      this.jumpAnchor =
        offset !== null
          ? { feedEntryView: this.focusedFeedEntryView, offset }
          : null;

      if (feedEntryViews.length - 1 <= newIndex) {
        this.onApproachingBottom();
      }
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

  @HostListener('document:keypress', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    if (this.modalOpenService.isModalOpen) {
      return;
    }

    const activeElement = document.activeElement;
    if (
      activeElement !== null &&
      ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)
    ) {
      return;
    }

    switch (event.key) {
      case 'm': {
        const focusedFeedEntry = this.focusedFeedEntryView;
        if (focusedFeedEntry !== null) {
          const feedEntry = focusedFeedEntry.feedEntry;
          if (feedEntry === undefined) {
            return;
          }

          if (!feedEntry.isRead) {
            feedEntry.isRead = true;
            this.readCounterService.markRead(feedEntry);
          } else {
            feedEntry.isRead = false;
            this.readCounterService.markUnread(feedEntry);
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
        });
        break;
      }
      case 'k': {
        this.moveFocus((currentIndex: number, _listLength: number) => {
          let newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = 0;
          }
          return newIndex;
        });
        break;
      }
      case 'n': {
        const focusedFeedEntry = this.focusedFeedEntryView;
        if (focusedFeedEntry !== null) {
          const feedEntry = focusedFeedEntry.feedEntry;
          if (feedEntry === undefined) {
            return;
          }

          window.open(feedEntry.url, '_blank');
        }
        break;
      }
      case 'r': {
        this.reload();
        break;
      }
    }
  }

  onReload() {
    this.reload();
  }

  onLoadMore() {
    this.onApproachingBottom();
  }
}
