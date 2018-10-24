import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from '@app/_services/alert.service';
import { deleteSessionToken } from '@app/_modules/session.module';

@Injectable()
export class HttpErrorService {
    constructor(
        private alertService: AlertService,
        private router: Router,
    ) { }

    handleError(error: any) {
        console.log(error);

        let errorMessage = 'Unknown Error';
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
        this.alertService.error(errorMessage);
    }
}
