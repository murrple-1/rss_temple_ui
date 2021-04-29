import { Injectable, OnDestroy } from '@angular/core';

import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  Observable,
  Subject,
} from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { Feed } from '@app/models';
import { HttpErrorService, SessionService } from '@app/services';
import { FeedService } from '@app/services/data';

type FeedImpl = Required<Pick<Feed, 'uuid' | 'unreadCount'>>;

const timeoutInterval = 20000;

@Injectable()
export class FeedCountsObservableService implements OnDestroy {
  private _feedCounts$ = new BehaviorSubject<Record<string, number>>({});
  readonly feedCounts$: Observable<Record<string, number>> = this._feedCounts$;

  private refreshTimeoutId: number | null = null;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private feedService: FeedService,
    private httpErrorService: HttpErrorService,
  ) {
    combineLatest([
      fromEvent(document, 'visibilitychange').pipe(
        map(_event => undefined),
        startWith(undefined),
      ),
      this.sessionService.isLoggedIn$,
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([_visibilityChangeEvent, isLoggedIn]) => {
          if (isLoggedIn && document.visibilityState === 'visible') {
            this.refresh();
          } else {
            if (this.refreshTimeoutId !== null) {
              window.clearTimeout(this.refreshTimeoutId);
            }
          }
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
    }
  }

  refresh() {
    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    this.feedService
      .queryAll({
        fields: ['uuid', 'unreadCount'],
        returnTotalCount: false,
        search: 'subscribed:"true"',
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        map(response => {
          if (response.objects !== undefined) {
            return response.objects as FeedImpl[];
          }
          throw new Error('malformed response');
        }),
      )
      .subscribe({
        next: feeds => {
          const feedCounts: Record<string, number> = {};
          for (const feed of feeds) {
            feedCounts[feed.uuid] = feed.unreadCount;
          }

          this._feedCounts$.next(feedCounts);

          this.refreshTimeoutId = window.setTimeout(
            this.refresh.bind(this),
            timeoutInterval,
          );
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  decrement(feedUuid: string) {
    const feedCounts: Record<string, number> = {
      ...this._feedCounts$.getValue(),
    };
    const oldCount = feedCounts[feedUuid];
    if (oldCount !== undefined && oldCount > 0) {
      feedCounts[feedUuid] = oldCount - 1;

      this._feedCounts$.next(feedCounts);
    }
  }

  increment(feedUuid: string) {
    const feedCounts: Record<string, number> = {
      ...this._feedCounts$.getValue(),
    };
    const oldCount = feedCounts[feedUuid];
    if (oldCount !== undefined) {
      feedCounts[feedUuid] = oldCount + 1;

      this._feedCounts$.next(feedCounts);
    }
  }
}
