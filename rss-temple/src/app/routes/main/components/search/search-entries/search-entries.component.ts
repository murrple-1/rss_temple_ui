import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { combineLatest, Observable, of, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { Feed, FeedEntry } from '@app/models';
import { FeedEntryService, FeedService } from '@app/services/data';
import { HttpErrorService } from '@app/services';
import { Sort } from '@app/services/data/sort.interface';

type FeedImpl = Required<Pick<Feed, 'uuid' | 'title' | 'feedUrl' | 'homeUrl'>>;
type FeedEntryImpl = Required<
  Pick<FeedEntry, 'publishedAt' | 'feedUuid' | 'title' | 'url'>
>;

interface FeedEntryDescriptor {
  title: string;
  url: string;
  publishedAt: Date;
  feedTitle: string;
  feedUrl: string;
  feedHomeUrl: string | null;
}

@Component({
  templateUrl: './search-entries.component.html',
  styleUrls: ['./search-entries.component.scss'],
})
export class SearchEntriesComponent implements OnInit, OnDestroy {
  readonly maxEntries = 12;

  searchText = '';

  isSearching = false;

  feedEntryDescriptors: FeedEntryDescriptor[] = [];

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
              this.searchText = searchText;
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

    const searchText = this.searchText;
    if (searchText.length < 1) {
      return;
    }

    this.isSearching = true;

    this.feedEntryService
      .query({
        fields: [
          'authorName',
          'content',
          'publishedAt',
          'feedUuid',
          'title',
          'url',
        ],
        count: this.maxEntries,
        returnTotalCount: false,
        search: `title:"${searchText}" or content:"${searchText}"`,
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
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([feedEntries, feedEntryFeeds]) => {
          const feedEntryDescriptors = feedEntries.map<FeedEntryDescriptor>(
            fe => {
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
            },
          );

          this.zone.run(() => {
            this.isSearching = false;
            this.feedEntryDescriptors = feedEntryDescriptors;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.isSearching = false;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }

  goTo(feedUrl: string) {
    this.router.navigate(['/main/feed', feedUrl]);
  }
}
