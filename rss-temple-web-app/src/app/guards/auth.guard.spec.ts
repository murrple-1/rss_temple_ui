import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  PRIMARY_OUTLET,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlSegmentGroup,
  UrlTree,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  type MockedObject,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AuthStateService } from '@app/services';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { AuthGuard, NoAuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn().mockName('Router.createUrlTree'),
          },
        },
        {
          provide: MOCK_COOKIE_SERVICE_CONFIG,
          useValue: {},
        },
        {
          provide: CookieService,
          useClass: MockCookieService,
        },
        AuthStateService,
        AuthGuard,
      ],
    });
  });

  beforeEach(() => {
    const authStateService = TestBed.inject(AuthStateService);
    authStateService.removeLoggedInFlagFromCookieStorage();
    authStateService.removeLoggedInFlagFromLocalStorage();
  });

  it('can activate', () => {
    const routerSpy = TestBed.inject(Router) as MockedObject<Router>;
    const authStateService = TestBed.inject(AuthStateService);
    const authGuard = TestBed.inject(AuthGuard);

    authStateService.isLoggedIn$.next(true);

    const activatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(authGuard.canActivate(activatedRouteSnapshot, state)).toBe(true);
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(0);
  });

  it('can not activate', () => {
    const routerSpy = TestBed.inject(Router) as MockedObject<Router>;
    const authGuard = TestBed.inject(AuthGuard);

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
    routerSpy.createUrlTree.mockReturnValue(fakeUrlTree);

    const activatedRouteSnapshot = {
      url: [''] as unknown as UrlSegment[],
    } as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(authGuard.canActivate(activatedRouteSnapshot, state)).toEqual(
      fakeUrlTree,
    );
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(1);
  });

  it('will not renavigate to the same place', () => {
    const routerSpy = TestBed.inject(Router) as MockedObject<Router>;
    const authGuard = TestBed.inject(AuthGuard);

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
    routerSpy.createUrlTree.mockReturnValue(fakeUrlTree);

    const activatedRouteSnapshot = {
      url: ['test'] as unknown as UrlSegment[],
    } as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(authGuard.canActivate(activatedRouteSnapshot, state)).toBe(true);
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(1);
  });
});

describe('NoAuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn().mockName('Router.createUrlTree'),
          },
        },
        {
          provide: MOCK_COOKIE_SERVICE_CONFIG,
          useValue: {},
        },
        {
          provide: CookieService,
          useClass: MockCookieService,
        },
        AuthStateService,
        NoAuthGuard,
      ],
    });
  });

  beforeEach(() => {
    const authStateService = TestBed.inject(AuthStateService);
    authStateService.removeLoggedInFlagFromCookieStorage();
    authStateService.removeLoggedInFlagFromLocalStorage();
  });

  it('can activate', () => {
    const routerSpy = TestBed.inject(Router) as MockedObject<Router>;
    const noAuthGuard = TestBed.inject(NoAuthGuard);

    const activatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(noAuthGuard.canActivate(activatedRouteSnapshot, state)).toBe(true);
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(0);
  });

  it('can not activate', () => {
    const routerSpy = TestBed.inject(Router) as MockedObject<Router>;
    const authStateService = TestBed.inject(AuthStateService);
    const noAuthGuard = TestBed.inject(NoAuthGuard);

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
    routerSpy.createUrlTree.mockReturnValue(fakeUrlTree);

    authStateService.isLoggedIn$.next(true);

    const activatedRouteSnapshot = {
      url: [''] as unknown as UrlSegment[],
    } as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(noAuthGuard.canActivate(activatedRouteSnapshot, state)).toEqual(
      fakeUrlTree,
    );
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(1);
  });

  it('will not renavigate to the same place', () => {
    const routerSpy = TestBed.inject(Router) as MockedObject<Router>;
    const authStateService = TestBed.inject(AuthStateService);
    const noAuthGuard = TestBed.inject(NoAuthGuard);

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
    routerSpy.createUrlTree.mockReturnValue(fakeUrlTree);

    authStateService.isLoggedIn$.next(true);

    const activatedRouteSnapshot = {
      url: ['test'] as unknown as UrlSegment[],
    } as ActivatedRouteSnapshot;
    const state = {
      url: 'http://example.com',
    } as RouterStateSnapshot;

    expect(noAuthGuard.canActivate(activatedRouteSnapshot, state)).toBe(true);
    expect(routerSpy.createUrlTree).toHaveBeenCalledTimes(1);
  });
});
