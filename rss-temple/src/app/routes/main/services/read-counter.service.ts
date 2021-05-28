import { Injectable, OnDestroy } from '@angular/core';

import {
  BehaviorSubject,
  combineLatest,
  concat,
  forkJoin,
  fromEvent,
  Observable,
  of,
  race,
  Subject,
} from 'rxjs';
import {
  buffer,
  debounceTime,
  elementAt,
  map,
  startWith,
  switchMap,
  take,
  takeUntil,
} from 'rxjs/operators';

import { FeedEntryService, FeedService } from '@app/services/data';
import { HttpErrorService, SessionService } from '@app/services';
import { Feed, FeedEntry } from '@app/models';

type FeedImpl = Required<Pick<Feed, 'uuid' | 'unreadCount'>>;
type FeedEntryImpl = Required<Pick<FeedEntry, 'uuid' | 'feedUuid'>>;

const refreshTimeoutInterval = 20000;

function generateNotifierForBufferByCountAndDebouce(
  subject$: Observable<unknown>,
  bufferInterval: number,
  bufferCount: number,
): Observable<unknown> {
  return race([
    subject$.pipe(debounceTime(bufferInterval), take(1)),
    subject$.pipe(elementAt(bufferCount - 1)),
  ]).pipe(
    take(1),
    switchMap(value =>
      concat(
        of(value),
        generateNotifierForBufferByCountAndDebouce(
          subject$,
          bufferInterval,
          bufferCount,
        ),
      ),
    ),
  );
}

@Injectable()
export class ReadCounterService implements OnDestroy {
  private _feedCounts$ = new BehaviorSubject<Record<string, number>>({});
  readonly feedCounts$: Observable<Record<string, number>> = this._feedCounts$;

  private readUuids = new Set<string>();
  private unreadUuids = new Set<string>();
  private change$ = new Subject<void>();

  private refreshTimeoutId: number | null | undefined = undefined;

  private shouldRefresh = true;
  private readAllFeedUuids: string[] | null = null;

  private isNetworking = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private feedEntryService: FeedEntryService,
    private feedService: FeedService,
    private httpErrorService: HttpErrorService,
  ) {
    this.change$
      .pipe(
        buffer(
          generateNotifierForBufferByCountAndDebouce(this.change$, 1000, 25),
        ),
      )
      .subscribe({
        next: async () => {
          await this.syncServer();

          if (this.unreadUuids.size > 0 || this.readUuids.size > 0) {
            this.change$.next();
          }
        },
      });

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
            if (
              this.refreshTimeoutId !== null &&
              this.refreshTimeoutId !== undefined
            ) {
              window.clearTimeout(this.refreshTimeoutId);
            }
            this.refreshTimeoutId = undefined;

            if (!isLoggedIn) {
              this.shouldRefresh = false;
              this.readUuids.clear();
              this.unreadUuids.clear();
              this._feedCounts$.next({});
            }
          }
        },
      });
  }

  ngOnDestroy() {
    this.change$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.refreshTimeoutId !== null && this.refreshTimeoutId !== undefined) {
      window.clearTimeout(this.refreshTimeoutId);
    }
  }

  markRead(feedEntry: FeedEntryImpl) {
    const feedCounts: Record<string, number> = {
      ...this._feedCounts$.getValue(),
    };
    const oldCount = feedCounts[feedEntry.feedUuid];
    if (oldCount !== undefined && oldCount > 0) {
      feedCounts[feedEntry.feedUuid] = oldCount - 1;

      this._feedCounts$.next(feedCounts);
    }

    this.readUuids.add(feedEntry.uuid);
    this.unreadUuids.delete(feedEntry.uuid);
    this.change$.next();
  }

  markUnread(feedEntry: FeedEntryImpl) {
    const feedCounts: Record<string, number> = {
      ...this._feedCounts$.getValue(),
    };
    const oldCount = feedCounts[feedEntry.feedUuid];
    if (oldCount !== undefined) {
      feedCounts[feedEntry.feedUuid] = oldCount + 1;

      this._feedCounts$.next(feedCounts);
    }

    this.unreadUuids.add(feedEntry.uuid);
    this.readUuids.delete(feedEntry.uuid);
    this.change$.next();
  }

  async readAll(feedUuids: string[]) {
    const feedCounts: Record<string, number> = {
      ...this._feedCounts$.getValue(),
    };
    for (const feedUuid of Object.keys(feedCounts)) {
      feedCounts[feedUuid] = 0;
    }

    this._feedCounts$.next(feedCounts);

    this.readUuids.clear();
    this.unreadUuids.clear();
    this.readAllFeedUuids = feedUuids;

    await this.syncServer();
  }

  private async refresh() {
    if (this.refreshTimeoutId !== null && this.refreshTimeoutId !== undefined) {
      window.clearTimeout(this.refreshTimeoutId);
    }
    this.refreshTimeoutId = null;

    this.shouldRefresh = true;
    await this.syncServer();

    if (this.refreshTimeoutId !== undefined) {
      this.refreshTimeoutId = window.setTimeout(
        this.refresh.bind(this),
        refreshTimeoutInterval,
      );
    }
  }

  private async syncServer() {
    if (this.isNetworking) {
      return;
    }

    try {
      this.isNetworking = true;

      if (this.readUuids.size > 0 || this.unreadUuids.size > 0) {
        const readUuids = Array.from(this.readUuids);
        const unreadUuids = Array.from(this.unreadUuids);

        this.readUuids.clear();
        this.unreadUuids.clear();

        const readSomeObservable =
          readUuids.length > 0
            ? this.feedEntryService.readSome(readUuids, undefined)
            : of(undefined);
        const unreadSomeObservable =
          unreadUuids.length > 0
            ? this.feedEntryService.unreadSome(unreadUuids)
            : of(undefined);

        try {
          await forkJoin([
            readSomeObservable,
            unreadSomeObservable,
          ]).toPromise();
        } catch (reason) {
          this.httpErrorService.handleError(reason);
          throw reason;
        }
      }

      if (this.readAllFeedUuids !== null) {
        try {
          const feedUuids = this.readAllFeedUuids;
          this.readAllFeedUuids = null;
          await this.feedEntryService
            .readSome(undefined, feedUuids)
            .toPromise();
        } catch (reason) {
          this.httpErrorService.handleError(reason);
          throw reason;
        }
      }

      if (this.shouldRefresh) {
        this.shouldRefresh = false;

        const feeds = await this.feedService
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
          .toPromise();

        const feedCounts: Record<string, number> = {};
        for (const feed of feeds) {
          feedCounts[feed.uuid] = feed.unreadCount;
        }

        this._feedCounts$.next(feedCounts);
      }
    } finally {
      this.isNetworking = false;
    }
  }
}
