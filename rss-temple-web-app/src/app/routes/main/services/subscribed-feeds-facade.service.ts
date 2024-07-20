import { Injectable, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable, Subject, filter, map, takeUntil } from 'rxjs';

import { cacheObservable } from '@app/libs/cache-observable.lib';
import { Feed } from '@app/models';
import { FeedService } from '@app/services/data';
import { Sort } from '@app/services/data/sort.interface';

export type FeedImpl = Required<
  Pick<Feed, 'uuid' | 'calculatedTitle' | 'feedUrl' | 'homeUrl'>
>;

@Injectable()
export class SubscribedFeedsFacadeService implements OnDestroy {
  readonly feeds$: Observable<FeedImpl[]>;
  private clear: () => void;

  private unsubscribe$ = new Subject<void>();

  constructor(router: Router, feedService: FeedService) {
    const cachedObservable = cacheObservable(
      () =>
        feedService
          .queryAll({
            fields: ['uuid', 'calculatedTitle', 'feedUrl', 'homeUrl'],
            search: 'isSubscribed:"true"',
            sort: new Sort([['calculatedTitle', 'ASC']]),
            returnTotalCount: false,
          })
          .pipe(
            takeUntil(this.unsubscribe$),
            map(response => {
              if (response.objects !== undefined) {
                return response.objects as FeedImpl[];
              }
              throw new Error('malformed response');
            }),
            map(feeds => {
              for (const feed of feeds) {
                let calculatedTitle = feed.calculatedTitle.trim();
                if (calculatedTitle.length < 1) {
                  calculatedTitle = '[No Title]';
                }
                feed.calculatedTitle = calculatedTitle;
              }
              return feeds;
            }),
          ),
      undefined,
    );

    this.feeds$ = cachedObservable.observable;
    this.clear = cachedObservable.clear;

    router.events
      .pipe(
        takeUntil(this.unsubscribe$),
        filter(navEvent => navEvent instanceof NavigationStart),
      )
      .subscribe({
        next: () => {
          this.clear();
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
