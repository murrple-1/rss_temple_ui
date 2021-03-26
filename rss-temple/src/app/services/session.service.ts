import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SessionService implements OnDestroy {
  sessionToken$: BehaviorSubject<string | null>;

  private _isLoggedIn$: BehaviorSubject<boolean>;
  isLoggedIn$: Observable<boolean>;

  get isLoggedIn() {
    return this._isLoggedIn$.getValue();
  }

  private unsubscribe$ = new Subject<void>();

  constructor() {
    const sessionToken = localStorage.getItem('session-service:sessionToken');
    this.sessionToken$ = new BehaviorSubject(sessionToken);

    this._isLoggedIn$ = new BehaviorSubject(sessionToken !== null);
    this.isLoggedIn$ = this._isLoggedIn$;

    this.sessionToken$.pipe(skip(1), takeUntil(this.unsubscribe$)).subscribe({
      next: st => {
        if (st !== null) {
          localStorage.setItem('session-service:sessionToken', st);
          this._isLoggedIn$.next(true);
        } else {
          localStorage.removeItem('session-service:sessionToken');
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
