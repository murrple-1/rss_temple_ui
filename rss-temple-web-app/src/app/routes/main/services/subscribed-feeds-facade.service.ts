import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, map, takeUntil } from 'rxjs';

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

  private readonly unsubscribe$ = new Subject<void>();

  constructor(private feedService: FeedService) {
    this.feeds$ = cacheObservable(
      () =>
        this.feedService
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
      { minutes: 1 },
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
