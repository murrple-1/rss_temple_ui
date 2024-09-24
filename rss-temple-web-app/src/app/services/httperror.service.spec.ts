import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

import {
  AppAlertDescriptor,
  AppAlertsService,
} from '@app/services/app-alerts.service';
import { AuthStateService } from '@app/services/auth-state.service';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { HttpErrorService } from './httperror.service';

function setup() {
  spyOn(console, 'error');

  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
  const mockCookieService = new MockCookieService({});
  const authStateService = new AuthStateService(mockCookieService);
  const appAlertService = new AppAlertsService();

  const httpErrorService = new HttpErrorService(
    routerSpy,
    appAlertService,
    authStateService,
  );

  return {
    routerSpy,
    mockCookieService,
    authStateService,
    appAlertService,

    httpErrorService,
  };
}

describe('HttpErrorService', () => {
  beforeEach(() => {
    const mockCookieService = new MockCookieService({});
    const authStateService = new AuthStateService(mockCookieService);
    authStateService.removeLoggedInFlagFromCookieStorage();
    authStateService.removeLoggedInFlagFromLocalStorage();
  });

  it('should handle HttpErrorResponses', async () => {
    const { httpErrorService, appAlertService } = setup();

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

    await expectAsync(emitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        text: jasmine.any(String),
        type: 'danger',
        canClose: true,
        autoCloseInterval: 5000,
      }),
    );
  });

  it('should handle "no response" HttpErrorResponses', async () => {
    const { httpErrorService, appAlertService } = setup();
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
    await expectAsync(emitPromise).toBeResolvedTo({
      autoCloseInterval: 5000,
      canClose: true,
      text: 'Unable to connect to server',
      type: 'danger',
      key: 'unable-to-connect',
    });
  });

  it('should handle "session expired" HttpErrorResponses', async () => {
    const { httpErrorService, appAlertService, routerSpy } = setup();
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

    await expectAsync(emitPromise).toBeResolvedTo({
      autoCloseInterval: 5000,
      canClose: true,
      text: 'Session expired',
      type: 'danger',
      key: 'expired',
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle arbitrary errors', async () => {
    const { httpErrorService, appAlertService } = setup();

    const emitPromise = new Promise<AppAlertDescriptor>(resolve => {
      appAlertService.appAlertDescriptor$.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    httpErrorService.handleError('something');

    await expectAsync(emitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        text: jasmine.any(String),
        type: 'danger',
        canClose: true,
        autoCloseInterval: 5000,
      }),
    );
  });
});
