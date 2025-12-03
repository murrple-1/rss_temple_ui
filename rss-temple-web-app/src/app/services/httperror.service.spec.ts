import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { take } from 'rxjs/operators';
import {
  type MockedObject,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  AppAlertDescriptor,
  AppAlertsService,
} from '@app/services/app-alerts.service';
import { AuthStateService } from '@app/services/auth-state.service';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { HttpErrorService } from './httperror.service';

describe('HttpErrorService', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: vi.fn().mockName('Router.navigate'),
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
      ],
    });
  });

  beforeEach(() => {
    const authStateService = TestBed.inject(AuthStateService);

    authStateService.removeLoggedInFlagFromCookieStorage();
    authStateService.removeLoggedInFlagFromLocalStorage();
  });

  it('should handle HttpErrorResponses', async () => {
    const httpErrorService = TestBed.inject(HttpErrorService);
    const appAlertService = TestBed.inject(AppAlertsService);

    const emitPromise = new Promise<AppAlertDescriptor>(resolve => {
      appAlertService.appAlertDescriptor$.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    const response = new HttpErrorResponse({
      status: 400,
    });
    httpErrorService.handleError(response);

    await expect(emitPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.any(String),
        type: 'danger',
        canClose: true,
        autoCloseInterval: 5000,
      }),
    );
  });

  it('should handle "no response" HttpErrorResponses', async () => {
    const httpErrorService = TestBed.inject(HttpErrorService);
    const appAlertService = TestBed.inject(AppAlertsService);

    const response = new HttpErrorResponse({
      status: 0,
    });

    const emitPromise = new Promise<AppAlertDescriptor>(resolve => {
      appAlertService.appAlertDescriptor$.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    httpErrorService.handleError(response);
    await expect(emitPromise).resolves.toEqual({
      autoCloseInterval: 5000,
      canClose: true,
      text: 'Unable to connect to server',
      type: 'danger',
      key: 'unable-to-connect',
    });
  });

  it('should handle "session expired" HttpErrorResponses', async () => {
    const httpErrorService = TestBed.inject(HttpErrorService);
    const appAlertService = TestBed.inject(AppAlertsService);
    const routerSpy = TestBed.inject(Router) as MockedObject<Router>;

    const response = new HttpErrorResponse({
      status: 401,
    });

    const emitPromise = new Promise<AppAlertDescriptor>(resolve => {
      appAlertService.appAlertDescriptor$.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    httpErrorService.handleError(response);

    await expect(emitPromise).resolves.toEqual({
      autoCloseInterval: 5000,
      canClose: true,
      text: 'Session expired',
      type: 'danger',
      key: 'expired',
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle arbitrary errors', async () => {
    const httpErrorService = TestBed.inject(HttpErrorService);
    const appAlertService = TestBed.inject(AppAlertsService);

    const emitPromise = new Promise<AppAlertDescriptor>(resolve => {
      appAlertService.appAlertDescriptor$.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    httpErrorService.handleError('something');

    await expect(emitPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.any(String),
        type: 'danger',
        canClose: true,
        autoCloseInterval: 5000,
      }),
    );
  });
});
