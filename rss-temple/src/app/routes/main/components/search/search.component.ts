import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { forkJoin, Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

import { Feed, FeedEntry } from '@app/models';
import { FeedEntryService, FeedService } from '@app/services/data';
import { HttpErrorService } from '@app/services';
import { Sort } from '@app/services/data/sort.interface';

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

@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  readonly maxEntries = 12;

  searchText = '';

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
    this.route.paramMap.subscribe({
      next: paramMap => {
        const searchText = paramMap.get('searchText') ?? '';
        this.zone.run(() => {
          this.searchText = searchText;
        });

        this.reload();
      },
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private reload() {
    const searchText = this.searchText;
    if (searchText.length < 1) {
      this.feedEntryDescriptors = [];
      return;
    }

    forkJoin([
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
        ),
      this.feedService
        .query({
          fields: ['title', 'feedUrl', 'homeUrl'],
          count: this.maxEntries,
          returnTotalCount: false,
          search: `title:"${searchText}"`,
        })
        .pipe(
          map(response => {
            if (response.objects !== undefined) {
              return response.objects as FeedImpl2[];
            }
            throw new Error('malformed response');
          }),
        ),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([[feedEntries, feedEntryFeeds], feeds]) => {
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

          const feedDescriptors = feeds.map<FeedDescriptor>(f => ({
            title: f.title,
            feedUrl: f.feedUrl,
            homeUrl: f.homeUrl,
          }));

          this.zone.run(() => {
            this.feedEntryDescriptors = feedEntryDescriptors;
            this.feedDescriptors = feedDescriptors;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  goTo(feedUrl: string) {
    this.router.navigate(['/main/feed', feedUrl]);
  }
}
