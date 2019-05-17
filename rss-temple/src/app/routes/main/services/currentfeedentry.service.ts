import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeedEntry } from '@app/models';

@Injectable()
export class CurrentFeedEntryService implements OnDestroy {
  currentFeedEntry = new BehaviorSubject<FeedEntry | null>(null);

  private unsubscribe$ = new Subject<void>();

  constructor() {
    fromEvent<KeyboardEvent>(document, 'keypress')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: event => {
          console.log(event);
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
