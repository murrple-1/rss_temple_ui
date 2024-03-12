import {
  ActivatedRouteSnapshot,
  PRIMARY_OUTLET,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlSegmentGroup,
  UrlTree,
} from '@angular/router';

import { AuthStateService } from '@app/services';

import { AuthGuard, NoAuthGuard } from './auth.guard';

function setup_auth() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
  const authStateService = new AuthStateService();

  const authGuard = new AuthGuard(routerSpy, authStateService);

  return {
    routerSpy,
    authStateService,

    authGuard,
  };
}

describe('AuthGuard', () => {
  beforeEach(() => {
    AuthStateService.removeCSRFTokenFromStorage();
  });

  it('can activate', () => {
    const { routerSpy, authStateService, authGuard } = setup_auth();

    authStateService.csrfToken$.next('a-token');

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
  const authStateService = new AuthStateService();

  const noAuthGuard = new NoAuthGuard(routerSpy, authStateService);

  return {
    routerSpy,
    authStateService,

    noAuthGuard,
  };
}

describe('NoAuthGuard', () => {
  beforeEach(() => {
    AuthStateService.removeCSRFTokenFromStorage();
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
    const { routerSpy, authStateService, noAuthGuard } = setup_noauth();

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

    authStateService.csrfToken$.next('a-token');

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
    const { routerSpy, authStateService, noAuthGuard } = setup_noauth();

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

    authStateService.csrfToken$.next('a-token');

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
