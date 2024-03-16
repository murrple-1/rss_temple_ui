import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  isLoggedIn$: BehaviorSubject<boolean>;

  constructor() {
    this.isLoggedIn$ = new BehaviorSubject(AuthStateService.getLoggedInFlag());
  }

  private static getLoggedInFlag() {
    return (
      localStorage.getItem('auth-state-service:isLoggedIn') !== null ||
      sessionStorage.getItem('auth-state-service:isLoggedIn') !== null
    );
  }

  static setLoggedInFlagInLocalStorage() {
    localStorage.setItem('auth-state-service:isLoggedIn', 'true');
  }

  static removeLoggedInFlagFromLocalStorage() {
    localStorage.removeItem('auth-state-service:isLoggedIn');
  }

  static setLoggedInFlagInSessionStorage() {
    sessionStorage.setItem('auth-state-service:isLoggedIn', 'true');
  }

  static removeLoggedInFlagFromSessionStorage() {
    sessionStorage.removeItem('auth-state-service:isLoggedIn');
  }
}
