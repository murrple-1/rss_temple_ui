import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class APISessionService implements OnDestroy {
  sessionId$: BehaviorSubject<string | null>;

  private _isLoggedIn$: BehaviorSubject<boolean>;
  isLoggedIn$: Observable<boolean>;

  get isLoggedIn() {
    return this._isLoggedIn$.getValue();
  }

  private unsubscribe$ = new Subject<void>();

  constructor() {
    const sessionId = localStorage.getItem('api-session-service:sessionId');
    this.sessionId$ = new BehaviorSubject(sessionId);

    this._isLoggedIn$ = new BehaviorSubject(sessionId !== null);
    this.isLoggedIn$ = this._isLoggedIn$;

    this.sessionId$.pipe(skip(1), takeUntil(this.unsubscribe$)).subscribe({
      next: st => {
        if (st !== null) {
          localStorage.setItem('api-session-service:sessionId', st);
          this._isLoggedIn$.next(true);
        } else {
          localStorage.removeItem('api-session-service:sessionId');
          this._isLoggedIn$.next(false);
        }
      },
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
