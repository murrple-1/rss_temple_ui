import { Component, NgZone, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppAlertsService, WindowUnloadingService } from '@app/services';
import { AppAlertDescriptor } from '@app/services/app-alerts.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './app-alerts.component.html',
  styleUrls: ['./app-alerts.component.scss'],
  standalone: false,
})
export class AppAlertsComponent implements OnDestroy {
  appAlertDescriptors: AppAlertDescriptor[] = [];
  private uniqueAlertKeys = new Set<string>();
  autoCloseTimeoutHandles: [number, AppAlertDescriptor][] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(
    zone: NgZone,
    appAlertsService: AppAlertsService,
    windowUnloadingService: WindowUnloadingService,
  ) {
    appAlertsService.appAlertDescriptor$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: appAlertDescriptor => {
          if (windowUnloadingService.windowIsUnloading) {
            return;
          }

          if (appAlertDescriptor.autoCloseInterval !== null) {
            const handle = window.setTimeout(
              this.removeDescriptorViaTimeout.bind(this),
              appAlertDescriptor.autoCloseInterval,
              appAlertDescriptor,
            );
            this.autoCloseTimeoutHandles.push([handle, appAlertDescriptor]);
          }

          if (
            appAlertDescriptor.key === null ||
            !this.uniqueAlertKeys.has(appAlertDescriptor.key)
          ) {
            if (appAlertDescriptor.key !== null) {
              this.uniqueAlertKeys.add(appAlertDescriptor.key);
            }

            zone.run(() => {
              this.appAlertDescriptors = [
                ...this.appAlertDescriptors,
                appAlertDescriptor,
              ];
            });
          }
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  removeDescriptor(descriptor: AppAlertDescriptor) {
    this.appAlertDescriptors = this.appAlertDescriptors.filter(
      descriptor_ => descriptor_ !== descriptor,
    );

    if (descriptor.key !== null) {
      this.uniqueAlertKeys.delete(descriptor.key);
    }

    const autoCloseHandleTuple = this.autoCloseTimeoutHandles.find(
      ([_, descriptor_]) => descriptor_ === descriptor,
    );
    if (autoCloseHandleTuple !== undefined) {
      const [handle, _] = autoCloseHandleTuple;
      window.clearTimeout(handle);

      this.autoCloseTimeoutHandles = this.autoCloseTimeoutHandles.filter(
        ([handle_, __]) => handle_ !== handle,
      );
    }
  }

  private removeDescriptorViaTimeout(descriptor: AppAlertDescriptor) {
    this.appAlertDescriptors = this.appAlertDescriptors.filter(
      descriptor_ => descriptor_ !== descriptor,
    );

    if (descriptor.key !== null) {
      this.uniqueAlertKeys.delete(descriptor.key);
    }

    this.autoCloseTimeoutHandles = this.autoCloseTimeoutHandles.filter(
      ([_, descriptor_]) => descriptor !== descriptor_,
    );
  }
}
