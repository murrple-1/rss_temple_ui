import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private cookieService = inject(CookieService);

  isLoggedIn$: BehaviorSubject<boolean>;

  constructor() {
    this.isLoggedIn$ = new BehaviorSubject(this.getLoggedInFlag());
  }

  private getLoggedInFlag() {
    return (
      localStorage.getItem('auth-state-service:isLoggedIn') !== null ||
      this.cookieService.check('auth-state-service--isLoggedIn')
    );
  }

  setLoggedInFlagInLocalStorage() {
    localStorage.setItem('auth-state-service:isLoggedIn', 'true');
  }

  removeLoggedInFlagFromLocalStorage() {
    localStorage.removeItem('auth-state-service:isLoggedIn');
  }

  setLoggedInFlagInCookieStorage() {
    this.cookieService.set('auth-state-service--isLoggedIn', 'true', {
      sameSite: 'None',
      path: '/',
    });
  }

  removeLoggedInFlagFromCookieStorage() {
    this.cookieService.delete(
      'auth-state-service--isLoggedIn',
      '/',
      undefined,
      undefined,
      'None',
    );
  }
}
