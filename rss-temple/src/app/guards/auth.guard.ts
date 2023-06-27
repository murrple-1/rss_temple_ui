﻿import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { areOldAndNewRoutesTheSame } from '@app/guards/utils';
import { APISessionService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private apiSessionService: APISessionService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.apiSessionService.isLoggedIn) {
      return true;
    }

    const urlTree = this.router.createUrlTree([
      '/login',
      { returnUrl: state.url },
    ]);
    if (areOldAndNewRoutesTheSame(route, urlTree)) {
      return true;
    } else {
      return urlTree;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private apiSessionService: APISessionService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
    if (!this.apiSessionService.isLoggedIn) {
      return true;
    }

    const urlTree = this.router.createUrlTree(['/main']);
    if (areOldAndNewRoutesTheSame(route, urlTree)) {
      return true;
    } else {
      return urlTree;
    }
  }
}
