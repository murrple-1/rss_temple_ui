import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  UrlSegmentGroup,
  PRIMARY_OUTLET,
  UrlSegment,
} from '@angular/router';

import { AuthTokenService } from '@app/services';

import { AuthGuard, NoAuthGuard } from './auth.guard';

function setup_auth() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
  const authTokenService = new AuthTokenService();

  const authGuard = new AuthGuard(routerSpy, authTokenService);

  return {
    routerSpy,
    authTokenService,

    authGuard,
  };
}

describe('AuthGuard', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
    sessionStorage.removeItem('auth-token-service:authToken');
  });

  it('can activate', () => {
    const { routerSpy, authTokenService, authGuard } = setup_auth();

    authTokenService.authToken$.next('a-token');

    const activatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(authGuard.canActivate(activatedRouteSnapshot, state)).toBeTrue();
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(0);
  });

  it('can not activate', () => {
    const { routerSpy, authGuard } = setup_auth();

    const fakeUrlTree = {
      root: {
        children: {
          [PRIMARY_OUTLET]: {
            segments: ['test'] as unknown as UrlSegment[],
          } as UrlSegmentGroup,
        } as {
          [key: string]: UrlSegmentGroup;
        },
      } as UrlSegmentGroup,
    } as UrlTree;
    routerSpy.createUrlTree.and.returnValue(fakeUrlTree);

    const activatedRouteSnapshot = {
      url: [''] as unknown as UrlSegment[],
    } as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(authGuard.canActivate(activatedRouteSnapshot, state)).toBe(
      fakeUrlTree,
    );
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(1);
  });

  it('will not renavigate to the same place', () => {
    const { routerSpy, authGuard } = setup_auth();

    const fakeUrlTree = {
      root: {
        children: {
          [PRIMARY_OUTLET]: {
            segments: ['test'] as unknown as UrlSegment[],
          } as UrlSegmentGroup,
        } as {
          [key: string]: UrlSegmentGroup;
        },
      } as UrlSegmentGroup,
    } as UrlTree;
    routerSpy.createUrlTree.and.returnValue(fakeUrlTree);

    const activatedRouteSnapshot = {
      url: ['test'] as unknown as UrlSegment[],
    } as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(authGuard.canActivate(activatedRouteSnapshot, state)).toBeTrue();
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(1);
  });
});

function setup_noauth() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
  const authTokenService = new AuthTokenService();

  const noAuthGuard = new NoAuthGuard(routerSpy, authTokenService);

  return {
    routerSpy,
    authTokenService,

    noAuthGuard,
  };
}

describe('NoAuthGuard', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
    sessionStorage.removeItem('auth-token-service:authToken');
  });

  it('can activate', () => {
    const { routerSpy, noAuthGuard } = setup_noauth();

    const activatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(noAuthGuard.canActivate(activatedRouteSnapshot, state)).toBeTrue();
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(0);
  });

  it('can not activate', () => {
    const { routerSpy, authTokenService, noAuthGuard } = setup_noauth();

    const fakeUrlTree = {
      root: {
        children: {
          [PRIMARY_OUTLET]: {
            segments: ['test'] as unknown as UrlSegment[],
          } as UrlSegmentGroup,
        } as {
          [key: string]: UrlSegmentGroup;
        },
      } as UrlSegmentGroup,
    } as UrlTree;
    routerSpy.createUrlTree.and.returnValue(fakeUrlTree);

    authTokenService.authToken$.next('a-token');

    const activatedRouteSnapshot = {
      url: [''] as unknown as UrlSegment[],
    } as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(noAuthGuard.canActivate(activatedRouteSnapshot, state)).toBe(
      fakeUrlTree,
    );
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(1);
  });

  it('will not renavigate to the same place', () => {
    const { routerSpy, authTokenService, noAuthGuard } = setup_noauth();

    const fakeUrlTree = {
      root: {
        children: {
          [PRIMARY_OUTLET]: {
            segments: ['test'] as unknown as UrlSegment[],
          } as UrlSegmentGroup,
        } as {
          [key: string]: UrlSegmentGroup;
        },
      } as UrlSegmentGroup,
    } as UrlTree;
    routerSpy.createUrlTree.and.returnValue(fakeUrlTree);

    authTokenService.authToken$.next('a-token');

    const activatedRouteSnapshot = {
      url: ['test'] as unknown as UrlSegment[],
    } as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(noAuthGuard.canActivate(activatedRouteSnapshot, state)).toBeTrue();
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(1);
  });
});
