import { Injectable } from '@angular/core';

import { SnackbarService } from 'ngx-snackbar';

@Injectable()
export class AlertService {
  constructor(private snackbarService: SnackbarService) {}

  success(text: string) {
    this.message(text, 'success');
  }

  error(text: string) {
    this.message(text, 'error');
  }

  info(text: string) {
    this.message(text, 'info');
  }

  private message(text: string, customClass: string) {
    this.snackbarService.add({
      msg: text,
      customClass: customClass,
      action: {
        text: 'Dismiss',
      },
    });
  }
}
