import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { combineLatest, forkJoin, Observable, of, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { Feed, FeedEntry } from '@app/models';
import { FeedEntryService, FeedService } from '@app/services/data';
import { HttpErrorService } from '@app/services';
import { Sort } from '@app/services/data/sort.interface';
import { ClrLoadingState } from '@clr/angular';

type FeedImpl = Required<Pick<Feed, 'uuid' | 'title' | 'feedUrl' | 'homeUrl'>>;
type FeedEntryImpl = Required<
  Pick<FeedEntry, 'publishedAt' | 'feedUuid' | 'title' | 'url'>
>;
type FeedImpl2 = Required<Pick<Feed, 'title' | 'feedUrl' | 'homeUrl'>>;

interface FeedEntryDescriptor {
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
  readonly ClrLoadingState = ClrLoadingState;

  feedEntriesSearchTitle = '';
  feedEntriesSearchContent = '';
  feedEntriesSearchButtonState = ClrLoadingState.DEFAULT;
  feedEntriesLoadingState = LoadingState.IsNotLoading;

  feedsSearchTitle = '';
  feedsSearchButtonState = ClrLoadingState.DEFAULT;
  feedsLoadingState = LoadingState.IsNotLoading;

  feedEntryDescriptors: FeedEntryDescriptor[] = [];
  feedDescriptors: FeedDescriptor[] = [];

  private readonly unsubscribe$ = new Subject<void>();

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
              this.feedEntriesSearchTitle = searchText;
              this.feedEntriesSearchContent = searchText;
              this.feedsSearchTitle = searchText;
            });

            this.reload();
          }
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private reload() {
    this.feedEntryDescriptors = [];
    this.feedDescriptors = [];

    this.feedEntriesLoadingState = LoadingState.IsLoading;
    this.feedEntriesSearchButtonState = ClrLoadingState.LOADING;

    this.feedsLoadingState = LoadingState.IsLoading;
    this.feedsSearchButtonState = ClrLoadingState.LOADING;

    forkJoin([
      this.searchFeedEntries(
        this.feedEntriesSearchTitle,
        this.feedEntriesSearchContent,
        Count,
        0,
      ),
      this.searchFeeds(this.feedsSearchTitle, Count, 0),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([feedEntryDescriptors, feedDescriptors]) => {
          this.zone.run(() => {
            this.feedEntriesLoadingState = LoadingState.IsNotLoading;
            this.feedEntriesSearchButtonState = ClrLoadingState.SUCCESS;
            this.feedEntryDescriptors = feedEntryDescriptors;

            this.feedsLoadingState = LoadingState.IsNotLoading;
            this.feedsSearchButtonState = ClrLoadingState.SUCCESS;
            this.feedDescriptors = feedDescriptors;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.feedEntriesLoadingState = LoadingState.IsNotLoading;
            this.feedEntriesSearchButtonState = ClrLoadingState.ERROR;

            this.feedsLoadingState = LoadingState.IsNotLoading;
            this.feedsSearchButtonState = ClrLoadingState.ERROR;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }

  private searchFeedEntries(
    title: string,
    content: string,
    count: number,
    skip: number,
  ) {
    title = title.trim();
    content = content.trim();

    const searchParts: string[] = [];
    if (title.length > 0) {
      searchParts.push(`title:"${title}"`);
    }

    if (content.length > 0) {
      searchParts.push(`content:"${content}"`);
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
          return feedEntries.map<FeedEntryDescriptor>(fe => {
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
      searchParts.push(`title:"${title}"`);
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

  goTo(feedUrl: string) {
    this.router.navigate(['/main/feed', feedUrl]);
  }

  updateEntriesSearch() {
    this.feedEntryDescriptors = [];

    this.feedEntriesLoadingState = LoadingState.IsLoading;
    this.feedEntriesSearchButtonState = ClrLoadingState.LOADING;

    this.searchFeedEntries(
      this.feedEntriesSearchTitle,
      this.feedEntriesSearchContent,
      Count,
      0,
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feedEntryDescriptors => {
          this.zone.run(() => {
            this.feedEntriesLoadingState = LoadingState.IsNotLoading;
            this.feedEntriesSearchButtonState = ClrLoadingState.SUCCESS;
            this.feedEntryDescriptors = feedEntryDescriptors;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.feedEntriesLoadingState = LoadingState.IsNotLoading;
            this.feedEntriesSearchButtonState = ClrLoadingState.ERROR;
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
            this.feedsLoadingState = LoadingState.IsNotLoading;
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
    this.feedEntriesLoadingState = LoadingState.IsLoading;
    this.feedEntriesSearchButtonState = ClrLoadingState.LOADING;

    this.searchFeedEntries(
      this.feedEntriesSearchTitle,
      this.feedEntriesSearchContent,
      Count,
      this.feedEntryDescriptors.length,
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feedEntryDescriptors => {
          const feedEntryDescriptors_ = [
            ...this.feedEntryDescriptors,
            ...feedEntryDescriptors,
          ];

          this.zone.run(() => {
            this.feedEntriesLoadingState = LoadingState.IsNotLoading;
            this.feedEntriesSearchButtonState = ClrLoadingState.SUCCESS;
            this.feedEntryDescriptors = feedEntryDescriptors_;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.feedEntriesLoadingState = LoadingState.IsNotLoading;
            this.feedEntriesSearchButtonState = ClrLoadingState.ERROR;
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
            this.feedsLoadingState = LoadingState.IsNotLoading;
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
