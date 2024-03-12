import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService implements OnDestroy {
  csrfToken$: BehaviorSubject<string | null>;

  private _isLoggedIn$: BehaviorSubject<boolean>;
  isLoggedIn$: Observable<boolean>;

  private unsubscribe$ = new Subject<void>();

  get isLoggedIn() {
    return this._isLoggedIn$.getValue();
  }

  constructor() {
    let csrfToken = localStorage.getItem('auth-state-service:csrfToken');
    if (csrfToken === null) {
      csrfToken = sessionStorage.getItem('auth-state-service:csrfToken');
    }
    this.csrfToken$ = new BehaviorSubject(csrfToken);

    this._isLoggedIn$ = new BehaviorSubject(csrfToken !== null);
    this.isLoggedIn$ = this._isLoggedIn$;

    this.csrfToken$.pipe(skip(1), takeUntil(this.unsubscribe$)).subscribe({
      next: st => {
        this._isLoggedIn$.next(st !== null);
      },
    });
  }

  static setCSRFTokenInSessionStorage(csrfToken: string) {
    sessionStorage.setItem('auth-state-service:csrfToken', csrfToken);
  }

  static setCSRFTokenInLocalStorage(csrfToken: string) {
    localStorage.setItem('auth-state-service:csrfToken', csrfToken);
  }

  static removeCSRFTokenFromStorage() {
    localStorage.removeItem('auth-state-service:csrfToken');
    sessionStorage.removeItem('auth-state-service:csrfToken');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
