import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  concat,
  firstValueFrom,
  forkJoin,
  fromEvent,
  of,
  race,
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

import { AsyncTaskQueue } from '@app/libs/task-queue';
import { Feed, FeedEntry } from '@app/models';
import { AuthStateService, HttpErrorService } from '@app/services';
import { FeedEntryService, FeedService } from '@app/services/data';

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
  private _feedCounts$ = new BehaviorSubject<Record<string, number> | null>(
    null,
  );
  readonly feedCounts$: Observable<Record<string, number> | null> =
    this._feedCounts$;

  private readUuids = new Set<string>();
  private unreadUuids = new Set<string>();
  private change$ = new Subject<void>();

  private refreshTimeoutId: number | null | false = false;

  private taskQueue = new AsyncTaskQueue(50);

  private unsubscribe$ = new Subject<void>();

  constructor(
    private authStateService: AuthStateService,
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
          this.taskQueue.pushPriority(
            async () => {
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
                  await firstValueFrom(
                    forkJoin([readSomeObservable, unreadSomeObservable]).pipe(
                      takeUntil(this.unsubscribe$),
                    ),
                  );
                } catch (reason: unknown) {
                  this.httpErrorService.handleError(reason);
                  throw reason;
                }
              }
            },
            20,
            'readSome',
          );

          if (
            this.refreshTimeoutId !== null &&
            this.refreshTimeoutId !== false
          ) {
            window.clearTimeout(this.refreshTimeoutId);
          }

          if (this.refreshTimeoutId !== false) {
            this.refreshTimeoutId = window.setTimeout(
              this.refresh.bind(this),
              refreshTimeoutInterval,
            );
          }
        },
      });

    combineLatest([
      fromEvent(document, 'visibilitychange').pipe(
        map(_event => undefined),
        startWith(undefined),
      ),
      this.authStateService.isLoggedIn$,
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([_visibilityChangeEvent, isLoggedIn]) => {
          if (isLoggedIn) {
            if (document.visibilityState === 'visible') {
              this.refresh();
              this.taskQueue.startProcessing();
            } else {
              if (
                this.refreshTimeoutId !== null &&
                this.refreshTimeoutId !== false
              ) {
                window.clearTimeout(this.refreshTimeoutId);
              }
              this.refreshTimeoutId = null;

              this.taskQueue.stopProcessing();
            }
          } else {
            this._feedCounts$.next(null);

            if (
              this.refreshTimeoutId !== null &&
              this.refreshTimeoutId !== false
            ) {
              window.clearTimeout(this.refreshTimeoutId);
            }
            this.refreshTimeoutId = false;

            this.taskQueue.stopProcessing();
            this.taskQueue.queueEntries = [];
          }
        },
      });
  }

  ngOnDestroy() {
    this.change$.complete();

    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.refreshTimeoutId !== null && this.refreshTimeoutId !== false) {
      window.clearTimeout(this.refreshTimeoutId);
    }
  }

  markRead(feedEntry: FeedEntryImpl) {
    this.taskQueue.pushPriority(
      async () => {
        const feedCounts: Record<string, number> = {
          ...this._feedCounts$.getValue(),
        };
        const oldCount = feedCounts[feedEntry.feedUuid];
        if (oldCount !== undefined && oldCount > 0) {
          feedCounts[feedEntry.feedUuid] = oldCount - 1;

          this._feedCounts$.next(feedCounts);
        }
      },
      0,
      'markRead',
    );

    this.readUuids.add(feedEntry.uuid);
    this.unreadUuids.delete(feedEntry.uuid);
    this.change$.next();
  }

  markUnread(feedEntry: FeedEntryImpl) {
    this.taskQueue.pushPriority(
      async () => {
        const feedCounts: Record<string, number> = {
          ...this._feedCounts$.getValue(),
        };
        const oldCount = feedCounts[feedEntry.feedUuid];
        if (oldCount !== undefined) {
          feedCounts[feedEntry.feedUuid] = oldCount + 1;

          this._feedCounts$.next(feedCounts);
        }
      },
      0,
      'markUnread',
    );

    this.unreadUuids.add(feedEntry.uuid);
    this.readUuids.delete(feedEntry.uuid);
    this.change$.next();
  }

  readAll(feedUuids: string[]) {
    return new Promise<void>((resolve, reject) => {
      this.taskQueue.pushPriority(
        async () => {
          const feedCounts: Record<string, number> = {
            ...this._feedCounts$.getValue(),
          };
          for (const feedUuid of Object.keys(feedCounts)) {
            feedCounts[feedUuid] = 0;
          }

          this._feedCounts$.next(feedCounts);
        },
        0,
        'readAll mark',
      );

      this.taskQueue.pushPriority(
        async () => {
          try {
            await firstValueFrom(
              this.feedEntryService
                .readSome(undefined, feedUuids)
                .pipe(takeUntil(this.unsubscribe$)),
            );

            resolve();
          } catch (reason: unknown) {
            this.httpErrorService.handleError(reason);
            reject(reason);
            throw reason;
          }
        },
        20,
        'readAll API',
      );
    });
  }

  private refresh() {
    if (this.refreshTimeoutId !== null && this.refreshTimeoutId !== false) {
      window.clearTimeout(this.refreshTimeoutId);
    }
    this.refreshTimeoutId = null;

    if (!this.taskQueue.queueEntries.some(qe => qe.tag === 'refresh')) {
      this.taskQueue.pushPriority(
        async () => {
          try {
            let feeds: FeedImpl[];
            try {
              feeds = await firstValueFrom(
                this.feedService
                  .queryAll({
                    fields: ['uuid', 'unreadCount'],
                    returnTotalCount: false,
                    search: 'isSubscribed:"true"',
                  })
                  .pipe(
                    takeUntil(this.unsubscribe$),
                    map(response => {
                      if (response.objects !== undefined) {
                        return response.objects as FeedImpl[];
                      }
                      throw new Error('malformed response');
                    }),
                  ),
              );
            } catch (reason: unknown) {
              this.httpErrorService.handleError(reason);
              throw reason;
            }

            const feedCounts: Record<string, number> = {};
            for (const feed of feeds) {
              feedCounts[feed.uuid] = feed.unreadCount;
            }

            this._feedCounts$.next(feedCounts);
          } finally {
            if (this.refreshTimeoutId !== false) {
              this.refreshTimeoutId = window.setTimeout(
                this.refresh.bind(this),
                refreshTimeoutInterval,
              );
            }
          }
        },
        10,
        'refresh',
      );
    } else {
      this.refreshTimeoutId = window.setTimeout(
        this.refresh.bind(this),
        refreshTimeoutInterval,
      );
    }
  }
}
