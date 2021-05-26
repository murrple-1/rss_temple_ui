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
const actionQueueTimeoutInterval = 250;

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

  private actionQueueTimeoutId: number | null = null;
  private actionQueue: (() => Promise<void>)[] = [];

  private refreshTimeoutId: number | null = null;

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
        next: () => {
          this.actionQueue.push(async () => {
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
          });
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
    this.change$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
    }

    if (this.actionQueueTimeoutId !== null) {
      window.clearTimeout(this.actionQueueTimeoutId);
    }
  }

  markRead(feedEntry: FeedEntryImpl) {
    return new Promise<void>((resolve, reject) => {
      this.actionQueue.push(async () => {
        try {
          this.readUuids.add(feedEntry.uuid);
          this.unreadUuids.delete(feedEntry.uuid);
          this.change$.next();

          const feedCounts: Record<string, number> = {
            ...this._feedCounts$.getValue(),
          };
          const oldCount = feedCounts[feedEntry.feedUuid];
          if (oldCount !== undefined && oldCount > 0) {
            feedCounts[feedEntry.feedUuid] = oldCount - 1;

            this._feedCounts$.next(feedCounts);
          }

          resolve();
        } catch (reason) {
          reject(reason);
          throw reason;
        }
      });
    });
  }

  markUnread(feedEntry: FeedEntryImpl) {
    return new Promise<void>((resolve, reject) => {
      this.actionQueue.push(async () => {
        try {
          this.unreadUuids.add(feedEntry.uuid);
          this.readUuids.delete(feedEntry.uuid);
          this.change$.next();

          const feedCounts: Record<string, number> = {
            ...this._feedCounts$.getValue(),
          };
          const oldCount = feedCounts[feedEntry.feedUuid];
          if (oldCount !== undefined) {
            feedCounts[feedEntry.feedUuid] = oldCount + 1;

            this._feedCounts$.next(feedCounts);
          }

          resolve();
        } catch (reason) {
          reject(reason);
          throw reason;
        }
      });
    });
  }

  readAll() {
    return new Promise<void>((resolve, reject) => {
      this.actionQueue.push(async () => {
        try {
          const feedCounts: Record<string, number> = {
            ...this._feedCounts$.getValue(),
          };
          for (const feedUuid of Object.keys(feedCounts)) {
            feedCounts[feedUuid] = 0;
          }

          this._feedCounts$.next(feedCounts);

          resolve();
        } catch (reason) {
          reject(reason);
          throw reason;
        }
      });
    });
  }

  private async handleActions() {
    if (this.actionQueueTimeoutId !== null) {
      window.clearTimeout(this.actionQueueTimeoutId);
      this.actionQueueTimeoutId = null;
    }

    try {
      let action = this.actionQueue.shift();
      while (action !== undefined) {
        try {
          await action.bind(this)();
        } catch (e) {
          console.error(e);
        }
        action = this.actionQueue.shift();
      }
    } finally {
      this.actionQueueTimeoutId = window.setTimeout(
        this.handleActions.bind(this),
        actionQueueTimeoutInterval,
      );
    }
  }

  private refresh() {
    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    this.actionQueue.push(async () => {
      try {
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
      } finally {
        this.refreshTimeoutId = window.setTimeout(
          this.refresh.bind(this),
          refreshTimeoutInterval,
        );
      }
    });
  }
}
