import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  UrlSegmentGroup,
  PRIMARY_OUTLET,
  UrlSegment,
} from '@angular/router';

import { SessionService } from '@app/services';

import { AuthGuard, NoAuthGuard } from './auth.guard';

function setup_auth() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
  const sessionService = new SessionService();

  const authGuard = new AuthGuard(routerSpy, sessionService);

  return {
    routerSpy,
    sessionService,

    authGuard,
  };
}

describe('AuthGuard', () => {
  beforeEach(() => {
    localStorage.removeItem('session-service:sessionToken');
  });

  it('can activate', () => {
    const { routerSpy, sessionService, authGuard } = setup_auth();

    sessionService.sessionToken$.next('a-token');

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
            segments: (['test'] as unknown) as UrlSegment[],
          } as UrlSegmentGroup,
        } as {
          [key: string]: UrlSegmentGroup;
        },
      } as UrlSegmentGroup,
    } as UrlTree;
    routerSpy.createUrlTree.and.returnValue(fakeUrlTree);

    const activatedRouteSnapshot = {
      url: ([''] as unknown) as UrlSegment[],
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
            segments: (['test'] as unknown) as UrlSegment[],
          } as UrlSegmentGroup,
        } as {
          [key: string]: UrlSegmentGroup;
        },
      } as UrlSegmentGroup,
    } as UrlTree;
    routerSpy.createUrlTree.and.returnValue(fakeUrlTree);

    const activatedRouteSnapshot = {
      url: (['test'] as unknown) as UrlSegment[],
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
  const sessionService = new SessionService();

  const noAuthGuard = new NoAuthGuard(routerSpy, sessionService);

  return {
    routerSpy,
    sessionService,

    noAuthGuard,
  };
}

describe('NoAuthGuard', () => {
  beforeEach(() => {
    localStorage.removeItem('session-service:sessionToken');
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
    const { routerSpy, sessionService, noAuthGuard } = setup_noauth();

    const fakeUrlTree = {
      root: {
        children: {
          [PRIMARY_OUTLET]: {
            segments: (['test'] as unknown) as UrlSegment[],
          } as UrlSegmentGroup,
        } as {
          [key: string]: UrlSegmentGroup;
        },
      } as UrlSegmentGroup,
    } as UrlTree;
    routerSpy.createUrlTree.and.returnValue(fakeUrlTree);

    sessionService.sessionToken$.next('a-token');

    const activatedRouteSnapshot = {
      url: ([''] as unknown) as UrlSegment[],
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
    const { routerSpy, sessionService, noAuthGuard } = setup_noauth();

    const fakeUrlTree = {
      root: {
        children: {
          [PRIMARY_OUTLET]: {
            segments: (['test'] as unknown) as UrlSegment[],
          } as UrlSegmentGroup,
        } as {
          [key: string]: UrlSegmentGroup;
        },
      } as UrlSegmentGroup,
    } as UrlTree;
    routerSpy.createUrlTree.and.returnValue(fakeUrlTree);

    sessionService.sessionToken$.next('a-token');

    const activatedRouteSnapshot = {
      url: (['test'] as unknown) as UrlSegment[],
    } as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(noAuthGuard.canActivate(activatedRouteSnapshot, state)).toBeTrue();
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(1);
  });
});
