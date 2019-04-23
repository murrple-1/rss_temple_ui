import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AlertService } from '@app/services/alert.service';
import { deleteSessionToken } from '@app/libs/session.lib';

@Injectable()
export class HttpErrorService {
  constructor(private router: Router, private alertService: AlertService) {}

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
          this.router.navigate(['/login']);
          break;
      }
    }

    console.log(errorMessage, error);

    this.alertService.error(errorMessage, 5000);
  }
}
