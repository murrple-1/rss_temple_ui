import { Injectable, OnDestroy } from '@angular/core';

import { forkJoin, interval, Observable, of, race, Subject } from 'rxjs';
import {
  buffer,
  debounceTime,
  elementAt,
  expand,
  take,
  takeUntil,
} from 'rxjs/operators';

import { FeedEntryService } from '@app/services/data';
import { HttpErrorService } from '@app/services';

const bufferInterval = 1000;
const bufferCount = 25;

@Injectable()
export class ReadBufferService implements OnDestroy {
  private read$ = new Subject<
    [[string, number] | null, [string, number] | null]
  >();

  private unsubscribe$ = new Subject<void>();

  constructor(
    private feedEntryService: FeedEntryService,
    private httpErrorService: HttpErrorService,
  ) {
    const readDebouncing$ = this.read$.pipe(
      debounceTime(bufferInterval),
      take(1),
    );
    const readLimiting$ = this.read$.pipe(elementAt(bufferCount - 1));
    const readNotifier$ = interval(0).pipe(
      take(1),
      expand(() => race(readDebouncing$, readLimiting$)),
    );
    this.read$.pipe(buffer(this.read$.pipe(buffer(readNotifier$)))).subscribe({
      next: data => {
        const readUuids = data.map(d => d[0]).filter(e => e !== null) as [
          string,
          number,
        ][];
        const unreadUuids = data.map(d => d[1]).filter(e => e !== null) as [
          string,
          number,
        ][];

        const filteredReadUuids = readUuids
          .filter(([uuid, ts]) => {
            const unreadUuidEntry = unreadUuids.find(d => d[0] === uuid);
            if (unreadUuidEntry === undefined) {
              return true;
            } else {
              return unreadUuidEntry[1] < ts;
            }
          })
          .map(d => d[0]);

        const filteredUnreadUuids = unreadUuids
          .filter(([uuid, ts]) => {
            const readUuidEntry = readUuids.find(d => d[0] === uuid);
            if (readUuidEntry === undefined) {
              return true;
            } else {
              return readUuidEntry[1] < ts;
            }
          })
          .map(d => d[0]);

        const readSomeObservable: Observable<unknown> =
          filteredReadUuids.length > 0
            ? this.feedEntryService.readSome(filteredReadUuids)
            : of(undefined);
        const unreadSomeObservable: Observable<unknown> =
          filteredUnreadUuids.length > 0
            ? this.feedEntryService.unreadSome(filteredUnreadUuids)
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
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  markRead(feedEntryUuid: string) {
    this.read$.next([[feedEntryUuid, Date.now()], null]);
  }

  markUnread(feedEntryUuid: string) {
    this.read$.next([null, [feedEntryUuid, Date.now()]]);
  }
}
