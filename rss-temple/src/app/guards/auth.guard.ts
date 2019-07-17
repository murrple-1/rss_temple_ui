import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { sessionToken } from '@app/libs/session.lib';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (sessionToken() !== null) {
      return true;
    }

    this.router.navigate(['/login', { returnUrl: state.url }]);
    return false;
  }
}

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (sessionToken() === null) {
      return true;
    }

    this.router.navigate(['/main']);
    return false;
  }
}
