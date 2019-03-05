import { Injectable } from '@angular/core';

import { SnackbarService } from 'ngx-snackbar';

@Injectable()
export class AlertService {
  constructor(private snackbarService: SnackbarService) {}

  // TODO colors
  success(text: string) {
    this.message(text, 'white', 'green');
  }

  // TODO colors
  error(text: string) {
    this.message(text, 'white', 'red');
  }

  // TODO colors
  info(text: string) {
    this.message(text, 'black', 'grey');
  }

  private message(text: string, color: string, backgroudColor: string) {
    type Data = {
      id: string;
    };
    let data: Data | null = null;

    this.snackbarService.add({
      msg: text,
      color: color,
      background: backgroudColor,
      action: {
        text: 'Dismiss',
        onClick: () => {
          if (data) {
            this.snackbarService.remove(data.id);
          }
        },
      },
      onAdd: (_data: Data) => {
        data = _data;
      },
    });
  }
}
