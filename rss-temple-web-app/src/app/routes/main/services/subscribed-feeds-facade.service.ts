import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  CachedObservable,
  cacheObservable,
} from '@app/libs/cache-observable.lib';
import { Feed } from '@app/models';
import { FeedService } from '@app/services/data';
import { Sort } from '@app/services/data/sort.interface';

export type FeedImpl = Required<
  Pick<Feed, 'uuid' | 'calculatedTitle' | 'feedUrl' | 'homeUrl'>
>;

@Injectable()
export class SubscribedFeedsFacadeService {
  readonly feeds$: Observable<FeedImpl[]>;
  readonly clear: () => void;

  constructor(private feedService: FeedService) {
    const cachedObservable = cacheObservable(
      () =>
        this.feedService
          .queryAll({
            fields: ['uuid', 'calculatedTitle', 'feedUrl', 'homeUrl'],
            search: 'isSubscribed:"true"',
            sort: new Sort([['calculatedTitle', 'ASC']]),
            returnTotalCount: false,
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

    this.feeds$ = cachedObservable.observable;
    this.clear = cachedObservable.clear;
  }
}
