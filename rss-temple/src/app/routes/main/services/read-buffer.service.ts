import { Injectable, OnDestroy } from '@angular/core';

import { concat, forkJoin, Observable, of, race, Subject } from 'rxjs';
import {
  buffer,
  debounceTime,
  elementAt,
  switchMap,
  take,
  takeUntil,
} from 'rxjs/operators';

import { FeedEntryService } from '@app/services/data';
import { HttpErrorService } from '@app/services';

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
export class ReadBufferService implements OnDestroy {
  private readUuids = new Set<string>();
  private unreadUuids = new Set<string>();
  private change$ = new Subject<void>();

  private unsubscribe$ = new Subject<void>();

  constructor(
    private feedEntryService: FeedEntryService,
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

          forkJoin([readSomeObservable, unreadSomeObservable])
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              error: error => {
                this.httpErrorService.handleError(error);
              },
            });
        },
      });
  }

  ngOnDestroy() {
    this.change$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  markRead(feedEntryUuid: string) {
    this.readUuids.add(feedEntryUuid);
    this.unreadUuids.delete(feedEntryUuid);
    this.change$.next();
  }

  markUnread(feedEntryUuid: string) {
    this.unreadUuids.add(feedEntryUuid);
    this.readUuids.delete(feedEntryUuid);
    this.change$.next();
  }
}
