import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ClrLoadingState } from '@clr/angular';
import { format as formatDate } from 'date-fns';
import { where as langsWhere } from 'langs';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { compare } from '@app/libs/compare.lib';
import { Feed, FeedEntry } from '@app/models';
import { HttpErrorService } from '@app/services';
import { FeedEntryService, FeedService } from '@app/services/data';
import { Sort } from '@app/services/data/sort.interface';

type FeedImpl = Required<Pick<Feed, 'uuid' | 'title' | 'feedUrl' | 'homeUrl'>>;
type FeedEntryImpl = Required<
  Pick<FeedEntry, 'publishedAt' | 'feedUuid' | 'title' | 'url' | 'authorName'>
>;
type FeedImpl2 = Required<Pick<Feed, 'title' | 'feedUrl' | 'homeUrl'>>;

interface EntryDescriptor {
  title: string;
  url: string;
  publishedAt: Date;
  feedTitle: string;
  feedUrl: string;
  feedHomeUrl: string | null;
  authorName: string | null;
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

interface LanguageSelect {
  name: string;
  sortKey: string;
  value: string;
  imgSrc: string;
}

const Count = 10;

function languageSelectCompare(a: LanguageSelect, b: LanguageSelect): number {
  // english first
  if (a.sortKey === '__english__') {
    return -1;
  }
  if (b.sortKey === '__english__') {
    return 1;
  }

  // unknown last
  if (a.sortKey === '__unknown__') {
    return 1;
  }
  if (b.sortKey === '__unknown__') {
    return -1;
  }

  // everything else sorted alphabetically
  return compare(a.sortKey, b.sortKey);
}

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
  entriesAvailableLanguages: LanguageSelect[] | null = null;
  entriesLanguages: LanguageSelect[] = [];
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
              this.entriesSearchContent = '';
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

    this.feedEntryService
      .getLanguages('iso639_1')
      .pipe(takeUntil(this.unsubscribe$))
      .toPromise()
      .then(languages_Iso639_1 => {
        return Promise.all(
          Array.from(new Set(languages_Iso639_1)).map<
            Promise<LanguageSelect | null>
          >(async l => {
            switch (l) {
              case 'EN': {
                return {
                  name: 'English',
                  value: l,
                  sortKey: '__english__',
                  imgSrc: '/assets/language_icons/en.svg',
                };
              }
              case 'UN': {
                return {
                  name: 'Unknown',
                  value: l,
                  sortKey: '__unknown__',
                  imgSrc: '/assets/language_icons/un.svg',
                };
              }
              default: {
                const langData = langsWhere('1', l.toLowerCase());
                if (langData === undefined) {
                  return null;
                }
                return {
                  name: `${langData.local}/${langData.name}`,
                  value: l,
                  sortKey: langData.name,
                  imgSrc: `/assets/language_icons/${l.toLowerCase()}.svg`,
                };
              }
            }
          }),
        );
      })
      .then(languageSelects => {
        const languageSelects_ = languageSelects.filter(
          ls => ls !== null,
        ) as LanguageSelect[];
        languageSelects_.sort(languageSelectCompare);
        return languageSelects_;
      })
      .then(entriesAvailableLanguages => {
        this.entriesAvailableLanguages = entriesAvailableLanguages;
      })
      .catch(reason => {
        this.httpErrorService.handleError(reason);
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
    languages: string[],
    count: number,
    skip: number,
  ) {
    title = title.trim();
    content = content.trim();
    authorName = authorName.trim();

    const searchParts: string[] = ['isArchived:"false"'];
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

    if (languages.length > 0) {
      searchParts.push(`languageIso639_1:"${languages.join(',')}"`);
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
          'authorName',
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
        map(feedEntries => {
          for (const feedEntry of feedEntries) {
            let title_ = feedEntry.title.trim();
            if (title_.length < 1) {
              title_ = '[No Title]';
            }
            feedEntry.title = title_;
          }
          return feedEntries;
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
                map(feeds => {
                  for (const feed of feeds) {
                    let title_ = feed.title.trim();
                    if (title_.length < 1) {
                      title_ = '[No Title]';
                    }
                    feed.title = title_;
                  }
                  return feeds;
                }),
              );
          } else {
            feedsObservable = of([]);
          }

          return feedsObservable.pipe(
            map(feeds => [feedEntries, feeds] as [FeedEntryImpl[], FeedImpl[]]),
          );
        }),
        map(([feedEntries, feedEntryFeeds]) =>
          feedEntries.map<EntryDescriptor>(fe => {
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
              authorName: fe.authorName,
            };
          }),
        ),
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
          for (const feed of feeds) {
            let title_ = feed.title.trim();
            if (title_.length < 1) {
              title_ = '[No Title]';
            }
            feed.title = title_;
          }
          return feeds;
        }),
        map(feeds =>
          feeds.map<FeedDescriptor>(f => ({
            title: f.title,
            feedUrl: f.feedUrl,
            homeUrl: f.homeUrl,
          })),
        ),
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
      this.entriesLanguages.map(e => e.value),
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
      this.entriesLanguages.map(e => e.value),
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
