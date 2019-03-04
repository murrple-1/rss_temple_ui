import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AlertService, Message } from '@app/_services/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: 'alert.component.html',
  styleUrls: ['alert.component.scss'],
})
export class AlertComponent implements OnInit, OnDestroy {
  message: Message | null = null;

  private unsubscribe$ = new Subject<void>();

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertService
      .getMessage()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: message => {
          this.message = message;
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
