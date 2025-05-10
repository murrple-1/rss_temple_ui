import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ClrLoadingState } from '@clr/angular';
import { format as formatDate } from 'date-fns';
import { where as langsWhere } from 'langs';
import { Observable, combineLatest, firstValueFrom, of } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { compare } from '@app/libs/compare.lib';
import { Feed, FeedEntry } from '@app/models';
import { HttpErrorService, SubNavLinksService } from '@app/services';
import { FeedEntryService, FeedService } from '@app/services/data';
import { Sort } from '@app/services/data/sort.interface';

import { AbstractSearchComponent } from '../abstract-search.component';

type FeedImpl = Required<Pick<Feed, 'uuid' | 'title' | 'feedUrl' | 'homeUrl'>>;
type FeedEntryImpl = Required<
  Pick<FeedEntry, 'publishedAt' | 'feedUuid' | 'title' | 'url' | 'authorName'>
>;

interface FeedEntryDescriptor {
  title: string;
  url: string;
  publishedAt: Date;
  feedTitle: string;
  feedUrl: string;
  feedHomeUrl: string | null;
  authorName: string | null;
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
  templateUrl: './search-entries.component.html',
  styleUrls: ['./search-entries.component.scss'],
  standalone: false,
})
export class SearchEntriesComponent
  extends AbstractSearchComponent
  implements OnInit
{
  searchTitle = '';
  searchContent = '';
  searchAuthorName = '';
  searchPublishedAtStartDate: Date | null = null;
  searchPublishedAtEndDate: Date | null = null;
  searchButtonState = ClrLoadingState.DEFAULT;
  availableLanguages: LanguageSelect[] | null = null;
  searchLanguages: LanguageSelect[] = [];

  feedEntryDescriptors: FeedEntryDescriptor[] = [];

  get searchPublishedAtMinDate() {
    if (this.searchPublishedAtStartDate === null) {
      return undefined;
    } else {
      return formatDate(this.searchPublishedAtStartDate, 'yyyy-MM-dd');
    }
  }

  get searchPublishedAtMaxDate() {
    if (this.searchPublishedAtEndDate === null) {
      return undefined;
    } else {
      return formatDate(this.searchPublishedAtEndDate, 'yyyy-MM-dd');
    }
  }

  constructor(
    zone: NgZone,
    router: Router,
    route: ActivatedRoute,
    subnavLinksService: SubNavLinksService,
    private feedService: FeedService,
    private feedEntryService: FeedEntryService,
    private httpErrorService: HttpErrorService,
  ) {
    super(zone, router, route, subnavLinksService);
  }

  ngOnInit() {
    super.ngOnInit();

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
              this.searchTitle = searchText;
              this.searchContent = '';
              this.searchAuthorName = '';
              this.searchPublishedAtStartDate = null;
              this.searchPublishedAtEndDate = null;
              this.searchLanguages = [];
            });

            this.updateSearch();
          }
        },
      });

    firstValueFrom(
      this.feedEntryService
        .getLanguages('iso639_1')
        .pipe(takeUntil(this.unsubscribe$)),
    )
      .then(languages_Iso639_1 =>
        Promise.all(
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
        ),
      )
      .then(languageSelects => {
        const languageSelects_ = languageSelects.filter(
          ls => ls !== null,
        ) as LanguageSelect[];
        languageSelects_.sort(languageSelectCompare);
        return languageSelects_;
      })
      .then(entriesAvailableLanguages => {
        this.availableLanguages = entriesAvailableLanguages;
      })
      .catch(reason => {
        this.httpErrorService.handleError(reason);
      });
  }

  private doSearch(
    title: string,
    content: string,
    authorName: string,
    publishedAtStartDate: Date | null,
    publishedAtEndDate: Date | null,
    languages: string[],
    count: number,
    skip: number,
  ) {
    title = SearchEntriesComponent.cleanAndEscapeText(title);
    content = SearchEntriesComponent.cleanAndEscapeText(content);
    authorName = SearchEntriesComponent.cleanAndEscapeText(authorName);

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
          feedEntries.map<FeedEntryDescriptor>(fe => {
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

  updateSearch() {
    this.feedEntryDescriptors = [];

    this.loadingState = LoadingState.IsLoading;
    this.searchButtonState = ClrLoadingState.LOADING;

    this.doSearch(
      this.searchTitle,
      this.searchContent,
      this.searchAuthorName,
      this.searchPublishedAtStartDate,
      this.searchPublishedAtEndDate,
      this.searchLanguages.map(e => e.value),
      Count,
      0,
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: entryDescriptors => {
          this.zone.run(() => {
            this.loadingState =
              entryDescriptors.length < Count
                ? LoadingState.NoMoreToLoad
                : LoadingState.IsNotLoading;
            this.searchButtonState = ClrLoadingState.SUCCESS;
            this.feedEntryDescriptors = entryDescriptors;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.loadingState = LoadingState.IsNotLoading;
            this.searchButtonState = ClrLoadingState.ERROR;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }

  loadMore() {
    this.loadingState = LoadingState.IsLoading;
    this.searchButtonState = ClrLoadingState.LOADING;

    this.doSearch(
      this.searchTitle,
      this.searchContent,
      this.searchAuthorName,
      this.searchPublishedAtStartDate,
      this.searchPublishedAtEndDate,
      this.searchLanguages.map(e => e.value),
      Count,
      this.feedEntryDescriptors.length,
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: entryDescriptors => {
          const entryDescriptors_ = [
            ...this.feedEntryDescriptors,
            ...entryDescriptors,
          ];

          this.zone.run(() => {
            this.loadingState =
              entryDescriptors.length < Count
                ? LoadingState.NoMoreToLoad
                : LoadingState.IsNotLoading;
            this.searchButtonState = ClrLoadingState.SUCCESS;
            this.feedEntryDescriptors = entryDescriptors_;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.loadingState = LoadingState.IsNotLoading;
            this.searchButtonState = ClrLoadingState.ERROR;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }
}
