import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppAlertDescriptor {
  text: string;
  type: 'info' | 'warning' | 'danger';
  canClose: boolean;
  autoCloseInterval: number | null;
  key: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AppAlertsService {
  readonly appAlertDescriptor$ = new Subject<AppAlertDescriptor>();
}
