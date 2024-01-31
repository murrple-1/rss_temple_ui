import { Component, Input } from '@angular/core';

export interface AlertEntry {
  text: string;
  iconShape: string | null;
  type: 'danger' | 'warning' | 'success' | 'info';
}

@Component({
  selector: 'app-local-alerts',
  templateUrl: './local-alerts.component.html',
  styleUrls: ['./local-alerts.component.scss'],
})
export class LocalAlertsComponent {
  @Input()
  alertEntries: AlertEntry[] = [];
}
