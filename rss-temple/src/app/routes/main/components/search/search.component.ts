import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { ClrLoadingState } from '@clr/angular';

import { combineLatest, Observable, of, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { format as formatDate } from 'date-fns';

import { Feed, FeedEntry } from '@app/models';
import { FeedEntryService, FeedService } from '@app/services/data';
import { HttpErrorService } from '@app/services';
import { Sort } from '@app/services/data/sort.interface';

type FeedImpl = Required<Pick<Feed, 'uuid' | 'title' | 'feedUrl' | 'homeUrl'>>;
type FeedEntryImpl = Required<
  Pick<FeedEntry, 'publishedAt' | 'feedUuid' | 'title' | 'url'>
>;
type FeedImpl2 = Required<Pick<Feed, 'title' | 'feedUrl' | 'homeUrl'>>;

interface EntryDescriptor {
  title: string;
  url: string;
  publishedAt: Date;
  feedTitle: string;
  feedUrl: string;
  feedHomeUrl: string | null;
}

interface FeedDescriptor {
  title: string;
  feedUrl: string;
  homeUrl: string | null;
}

enum LoadingState {
  IsLoading,
  IsNotLoading,
  NoMoreToLoad,
}

const Count = 10;

@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  readonly LoadingState = LoadingState;

  entriesSearchTitle = '';
  entriesSearchContent = '';
  entriesSearchAuthorName = '';
  entriesSearchPublishedAtStartDate: Date | null = null;
  entriesSearchPublishedAtEndDate: Date | null = null;
  entriesSearchButtonState = ClrLoadingState.DEFAULT;
  entriesLoadingState = LoadingState.IsNotLoading;

  feedsSearchTitle = '';
  feedsSearchButtonState = ClrLoadingState.DEFAULT;
  feedsLoadingState = LoadingState.IsNotLoading;

  entryDescriptors: EntryDescriptor[] = [];
  feedDescriptors: FeedDescriptor[] = [];

  private readonly unsubscribe$ = new Subject<void>();

  get entriesSearchPublishedAtMinDate() {
    if (this.entriesSearchPublishedAtStartDate === null) {
      return undefined;
    } else {
      return formatDate(this.entriesSearchPublishedAtStartDate, 'yyyy-MM-dd');
    }
  }

  get entriesSearchPublishedAtMaxDate() {
    if (this.entriesSearchPublishedAtEndDate === null) {
      return undefined;
    } else {
      return formatDate(this.entriesSearchPublishedAtEndDate, 'yyyy-MM-dd');
    }
  }

  constructor(
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private feedService: FeedService,
    private feedEntryService: FeedEntryService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnInit() {
    combineLatest([
      this.route.paramMap.pipe(startWith(undefined)),
      this.router.events.pipe(startWith(undefined)),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([paramMap, navigationEvent]) => {
          if (
            paramMap !== undefined &&
            (navigationEvent === undefined ||
              navigationEvent instanceof NavigationEnd)
          ) {
            const searchText = paramMap.get('searchText') ?? '';
            this.zone.run(() => {
              this.entriesSearchTitle = searchText;
              this.entriesSearchContent = searchText;
              this.entriesSearchAuthorName = '';
              this.entriesSearchPublishedAtStartDate = null;
              this.entriesSearchPublishedAtEndDate = null;

              this.feedsSearchTitle = searchText;
            });

            this.updateEntriesSearch();
            this.updateFeedsSearch();
          }
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private searchEntries(
    title: string,
    content: string,
    authorName: string,
    publishedAtStartDate: Date | null,
    publishedAtEndDate: Date | null,
    count: number,
    skip: number,
  ) {
    title = title.trim();
    content = content.trim();
    authorName = authorName.trim();

    const searchParts: string[] = [];
    if (title.length > 0) {
      searchParts.push(`title:"${title}"`);
    }

    if (content.length > 0) {
      searchParts.push(`content:"${content}"`);
    }

    if (authorName.length > 0) {
      searchParts.push(`authorName:"${authorName}"`);
    }

    if (publishedAtStartDate !== null && publishedAtEndDate !== null) {
      searchParts.push(
        `publishedAt:"${formatDate(
          publishedAtStartDate,
          'yyyy-MM-dd 00:00:00',
        )}|${formatDate(publishedAtEndDate, 'yyyy-MM-dd 23:59:59')}"`,
      );
    }

    let search: string;
    if (searchParts.length > 0) {
      search = searchParts.join(' and ');
    } else {
      return of([]);
    }

    return this.feedEntryService
      .query({
        fields: [
          'authorName',
          'content',
          'publishedAt',
          'feedUuid',
          'title',
          'url',
        ],
        count,
        skip,
        returnTotalCount: false,
        search,
        sort: new Sort([['publishedAt', 'DESC']]),
      })
      .pipe(
        map(response => {
          if (response.objects !== undefined) {
            return response.objects as FeedEntryImpl[];
          }
          throw new Error('malformed response');
        }),
        switchMap(feedEntries => {
          let feedsObservable: Observable<FeedImpl[]>;
          if (feedEntries.length > 0) {
            const feedUuids = Array.from(
              new Set(feedEntries.map(fe => fe.feedUuid)),
            );

            feedsObservable = this.feedService
              .queryAll({
                fields: ['uuid', 'title', 'feedUrl', 'homeUrl'],
                returnTotalCount: false,
                search: `uuid:"${feedUuids.join(',')}"`,
              })
              .pipe(
                map(response => {
                  if (response.objects !== undefined) {
                    return response.objects as FeedImpl[];
                  }
                  throw new Error('malformed response');
                }),
              );
          } else {
            feedsObservable = of([]);
          }

          return feedsObservable.pipe(
            map(feeds => {
              return [feedEntries, feeds] as [FeedEntryImpl[], FeedImpl[]];
            }),
          );
        }),
        map(([feedEntries, feedEntryFeeds]) => {
          return feedEntries.map<EntryDescriptor>(fe => {
            const feed = feedEntryFeeds.find(f => f.uuid === fe.feedUuid);
            if (feed === undefined) {
              throw new Error('feed undefined');
            }

            return {
              title: fe.title,
              url: fe.url,
              publishedAt: fe.publishedAt,
              feedTitle: feed.title,
              feedUrl: feed.feedUrl,
              feedHomeUrl: feed.homeUrl,
            };
          });
        }),
      );
  }

  private searchFeeds(title: string, count: number, skip: number) {
    title = title.trim();

    const searchParts: string[] = [];
    if (title.length > 0) {
      searchParts.push(`calculatedTitle:"${title}"`);
    }

    let search: string;
    if (searchParts.length > 0) {
      search = searchParts.join(' and ');
    } else {
      return of([]);
    }

    return this.feedService
      .query({
        fields: ['title', 'feedUrl', 'homeUrl'],
        count,
        skip,
        returnTotalCount: false,
        search,
      })
      .pipe(
        map(response => {
          if (response.objects !== undefined) {
            return response.objects as FeedImpl2[];
          }
          throw new Error('malformed response');
        }),
        map(feeds => {
          return feeds.map<FeedDescriptor>(f => ({
            title: f.title,
            feedUrl: f.feedUrl,
            homeUrl: f.homeUrl,
          }));
        }),
      );
  }

  updateEntriesSearch() {
    this.entryDescriptors = [];

    this.entriesLoadingState = LoadingState.IsLoading;
    this.entriesSearchButtonState = ClrLoadingState.LOADING;

    this.searchEntries(
      this.entriesSearchTitle,
      this.entriesSearchContent,
      this.entriesSearchAuthorName,
      this.entriesSearchPublishedAtStartDate,
      this.entriesSearchPublishedAtEndDate,
      Count,
      0,
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: entryDescriptors => {
          this.zone.run(() => {
            this.entriesLoadingState =
              entryDescriptors.length < Count
                ? LoadingState.NoMoreToLoad
                : LoadingState.IsNotLoading;
            this.entriesSearchButtonState = ClrLoadingState.SUCCESS;
            this.entryDescriptors = entryDescriptors;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.entriesLoadingState = LoadingState.IsNotLoading;
            this.entriesSearchButtonState = ClrLoadingState.ERROR;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }

  updateFeedsSearch() {
    this.feedDescriptors = [];

    this.feedsLoadingState = LoadingState.IsLoading;
    this.feedsSearchButtonState = ClrLoadingState.LOADING;

    this.searchFeeds(this.feedsSearchTitle, Count, 0)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feedDescriptors => {
          this.zone.run(() => {
            this.feedsLoadingState =
              feedDescriptors.length < Count
                ? LoadingState.NoMoreToLoad
                : LoadingState.IsNotLoading;
            this.feedsSearchButtonState = ClrLoadingState.SUCCESS;
            this.feedDescriptors = feedDescriptors;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.feedsLoadingState = LoadingState.IsNotLoading;
            this.feedsSearchButtonState = ClrLoadingState.ERROR;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }

  loadMoreEntries() {
    this.entriesLoadingState = LoadingState.IsLoading;
    this.entriesSearchButtonState = ClrLoadingState.LOADING;

    this.searchEntries(
      this.entriesSearchTitle,
      this.entriesSearchContent,
      this.entriesSearchAuthorName,
      this.entriesSearchPublishedAtStartDate,
      this.entriesSearchPublishedAtEndDate,
      Count,
      this.entryDescriptors.length,
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: entryDescriptors => {
          const entryDescriptors_ = [
            ...this.entryDescriptors,
            ...entryDescriptors,
          ];

          this.zone.run(() => {
            this.entriesLoadingState =
              entryDescriptors.length < Count
                ? LoadingState.NoMoreToLoad
                : LoadingState.IsNotLoading;
            this.entriesSearchButtonState = ClrLoadingState.SUCCESS;
            this.entryDescriptors = entryDescriptors_;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.entriesLoadingState = LoadingState.IsNotLoading;
            this.entriesSearchButtonState = ClrLoadingState.ERROR;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }

  loadMoreFeeds() {
    this.feedsLoadingState = LoadingState.IsLoading;
    this.feedsSearchButtonState = ClrLoadingState.LOADING;

    this.searchFeeds(this.feedsSearchTitle, Count, this.feedDescriptors.length)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feedDescriptors => {
          const feedDescriptors_ = [
            ...this.feedDescriptors,
            ...feedDescriptors,
          ];

          this.zone.run(() => {
            this.feedsLoadingState =
              feedDescriptors.length < Count
                ? LoadingState.NoMoreToLoad
                : LoadingState.IsNotLoading;
            this.feedsSearchButtonState = ClrLoadingState.SUCCESS;
            this.feedDescriptors = feedDescriptors_;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.feedsLoadingState = LoadingState.IsNotLoading;
            this.feedsSearchButtonState = ClrLoadingState.ERROR;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }
}
