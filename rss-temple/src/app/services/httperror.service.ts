import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AppAlertsService } from '@app/services/app-alerts.service';
import { deleteSessionToken } from '@app/libs/session.lib';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorService {
  constructor(
    private router: Router,
    private appAlertsService: AppAlertsService,
  ) {}

  handleError(error: any) {
    let errorMessage = 'Unknown Error';
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to server';
          break;
        case 401:
          errorMessage = 'Session expired';
          deleteSessionToken();
          this.router.navigate(['/login'], {
            replaceUrl: true,
          });
          break;
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
