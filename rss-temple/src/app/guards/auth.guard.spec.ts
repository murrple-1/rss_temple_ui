import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { setSessionToken, deleteSessionToken } from '@app/libs/session.lib';

import { AuthGuard, NoAuthGuard } from './auth.guard';

function setup_auth() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  const authGuard = new AuthGuard(routerSpy);

  return {
    routerSpy,

    authGuard,
  };
}

describe('AuthGuard', () => {
  beforeEach(() => {
    deleteSessionToken();
  });

  it('can activate', () => {
    const { routerSpy, authGuard } = setup_auth();

    setSessionToken('a-token');

    const activatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(authGuard.canActivate(activatedRouteSnapshot, state)).toBeTrue();
    expect(routerSpy.navigate).toHaveBeenCalledTimes(0);
  });

  it('can not activate', () => {
    const { routerSpy, authGuard } = setup_auth();

    const activatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(authGuard.canActivate(activatedRouteSnapshot, state)).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });
});

function setup_noauth() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  const noAuthGuard = new NoAuthGuard(routerSpy);

  return {
    routerSpy,

    noAuthGuard,
  };
}

describe('NoAuthGuard', () => {
  beforeEach(() => {
    deleteSessionToken();
  });

  it('can activate', () => {
    const { routerSpy, noAuthGuard } = setup_noauth();

    const activatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(noAuthGuard.canActivate(activatedRouteSnapshot, state)).toBeTrue();
    expect(routerSpy.navigate).toHaveBeenCalledTimes(0);
  });

  it('can not activate', () => {
    const { routerSpy, noAuthGuard } = setup_noauth();

    setSessionToken('a-token');

    const activatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(noAuthGuard.canActivate(activatedRouteSnapshot, state)).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });
});
