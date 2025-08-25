import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AppAlertsService } from '@app/services/app-alerts.service';
import { AuthStateService } from '@app/services/auth-state.service';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorService {
  private router = inject(Router);
  private appAlertsService = inject(AppAlertsService);
  private authStateService = inject(AuthStateService);

  handleError(error: unknown) {
    let errorMessage = 'Unknown Error';
    let key: string | null = 'unknown-error';
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0: {
          errorMessage = 'Unable to connect to server';
          key = 'unable-to-connect';
          break;
        }
        case 401: {
          errorMessage = 'Session expired';
          key = 'expired';
          this.authStateService.removeLoggedInFlagFromCookieStorage();
          this.authStateService.removeLoggedInFlagFromLocalStorage();
          this.authStateService.isLoggedIn$.next(false);
          this.router.navigate(['/login']);
          break;
        }
        case 429: {
          errorMessage = 'Request throttled: Please try again in a few minutes';
          key = 'throttled';
          break;
        }
      }
    }

    console.error(errorMessage, error);

    this.appAlertsService.appAlertDescriptor$.next({
      autoCloseInterval: 5000,
      canClose: true,
      text: errorMessage,
      type: 'danger',
      key,
    });
  }
}
