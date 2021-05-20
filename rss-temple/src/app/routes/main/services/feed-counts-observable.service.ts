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

const refreshTimeoutInterval = 20000;
const actionQueueTimeoutInterval = 250;

@Injectable()
export class FeedCountsObservableService implements OnDestroy {
  private _feedCounts$ = new BehaviorSubject<Record<string, number>>({});
  readonly feedCounts$: Observable<Record<string, number>> = this._feedCounts$;

  private refreshTimeoutId: number | null = null;

  private actionQueueTimeoutId: number | null = null;
  private actionQueue: (() => Promise<void>)[] = [];

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
            this.handleActions();
          } else {
            this.actionQueue = [];

            if (this.refreshTimeoutId !== null) {
              window.clearTimeout(this.refreshTimeoutId);
            }

            if (this.actionQueueTimeoutId !== null) {
              window.clearTimeout(this.actionQueueTimeoutId);
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

    if (this.actionQueueTimeoutId !== null) {
      window.clearTimeout(this.actionQueueTimeoutId);
    }
  }

  async handleActions() {
    if (this.actionQueueTimeoutId !== null) {
      window.clearTimeout(this.actionQueueTimeoutId);
      this.actionQueueTimeoutId = null;
    }

    let action = this.actionQueue.pop();
    while (action !== undefined) {
      try {
        await action.bind(this)();
      } catch (e) {
        console.error(e);
      }
      action = this.actionQueue.pop();
    }

    this.actionQueueTimeoutId = window.setTimeout(
      this.handleActions.bind(this),
      actionQueueTimeoutInterval,
    );
  }

  refresh() {
    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    this.actionQueue.push(() =>
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
        .toPromise()
        .then(
          feeds => {
            const feedCounts: Record<string, number> = {};
            for (const feed of feeds) {
              feedCounts[feed.uuid] = feed.unreadCount;
            }

            this._feedCounts$.next(feedCounts);

            this.refreshTimeoutId = window.setTimeout(
              this.refresh.bind(this),
              refreshTimeoutInterval,
            );
          },
          reason => {
            this.httpErrorService.handleError(reason);
          },
        ),
    );
  }

  decrement(feedUuid: string) {
    this.actionQueue.push(async () => {
      const feedCounts: Record<string, number> = {
        ...this._feedCounts$.getValue(),
      };
      const oldCount = feedCounts[feedUuid];
      if (oldCount !== undefined && oldCount > 0) {
        feedCounts[feedUuid] = oldCount - 1;

        this._feedCounts$.next(feedCounts);
      }
    });
  }

  increment(feedUuid: string) {
    this.actionQueue.push(async () => {
      const feedCounts: Record<string, number> = {
        ...this._feedCounts$.getValue(),
      };
      const oldCount = feedCounts[feedUuid];
      if (oldCount !== undefined) {
        feedCounts[feedUuid] = oldCount + 1;

        this._feedCounts$.next(feedCounts);
      }
    });
  }

  zero() {
    this.actionQueue.push(async () => {
      const feedCounts: Record<string, number> = {
        ...this._feedCounts$.getValue(),
      };
      for (const feedUuid of Object.keys(feedCounts)) {
        feedCounts[feedUuid] = 0;
      }

      this._feedCounts$.next(feedCounts);
    });
  }
}
