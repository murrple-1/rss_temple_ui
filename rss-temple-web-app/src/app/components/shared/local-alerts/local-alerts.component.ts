import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ClrAlertModule, ClrIconModule } from '@clr/angular';

export interface AlertEntry {
  text: string;
  iconShape: string | null;
  type: 'danger' | 'warning' | 'success' | 'info';
}

@Component({
  selector: 'app-local-alerts',
  templateUrl: './local-alerts.component.html',
  styleUrls: ['./local-alerts.component.scss'],
  imports: [NgClass, ClrIconModule, ClrAlertModule],
})
export class LocalAlertsComponent {
  @Input()
  alertEntries: AlertEntry[] = [];
}
