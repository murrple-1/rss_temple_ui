import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AppAlertsService } from '@app/services/app-alerts.service';
import { AuthTokenService } from '@app/services/auth-token.service';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorService {
  constructor(
    private router: Router,
    private appAlertsService: AppAlertsService,
    private authTokenService: AuthTokenService,
  ) {}

  handleError(error: any) {
    let errorMessage = 'Unknown Error';
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0: {
          errorMessage = 'Unable to connect to server';
          break;
        }
        case 401: {
          errorMessage = 'Session expired';
          this.authTokenService.authToken$.next(null);
          localStorage.removeItem('auth-token-service:authToken');
          sessionStorage.removeItem('auth-token-service:authToken');
          this.router.navigate(['/login']);
          break;
        }
        case 420: {
          errorMessage = 'Request throttled: Please try again in a few minutes';
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
    });
  }
}
