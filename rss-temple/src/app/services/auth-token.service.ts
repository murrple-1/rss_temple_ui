import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService implements OnDestroy {
  authToken$: BehaviorSubject<string | null>;

  private _isLoggedIn$: BehaviorSubject<boolean>;
  isLoggedIn$: Observable<boolean>;

  get isLoggedIn() {
    return this._isLoggedIn$.getValue();
  }

  private unsubscribe$ = new Subject<void>();

  constructor() {
    let authToken = localStorage.getItem('auth-token-service:authToken');
    if (authToken === null) {
      authToken = sessionStorage.getItem('auth-token-service:authToken');
    }
    this.authToken$ = new BehaviorSubject(authToken);

    this._isLoggedIn$ = new BehaviorSubject(authToken !== null);
    this.isLoggedIn$ = this._isLoggedIn$;

    this.authToken$.pipe(skip(1), takeUntil(this.unsubscribe$)).subscribe({
      next: st => {
        this._isLoggedIn$.next(st !== null);
      },
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
