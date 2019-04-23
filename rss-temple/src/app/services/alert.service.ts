import { Injectable } from '@angular/core';

import { SnackbarService } from 'ngx-snackbar';

@Injectable()
export class AlertService {
  constructor(private snackbarService: SnackbarService) {}

  success(text: string, timeoutMilliseconds?: number) {
    this.message(text, 'success', timeoutMilliseconds);
  }

  error(text: string, timeoutMilliseconds?: number) {
    this.message(text, 'error', timeoutMilliseconds);
  }

  info(text: string, timeoutMilliseconds?: number) {
    this.message(text, 'info', timeoutMilliseconds);
  }

  private message(
    text: string,
    customClass: string,
    timeoutMilliseconds?: number,
  ) {
    this.snackbarService.add({
      msg: text,
      customClass: customClass,
      action: {
        text: 'Dismiss',
      },
      timeout: timeoutMilliseconds,
    });
  }
}
