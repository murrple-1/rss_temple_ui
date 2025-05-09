import { Component, NgZone, OnDestroy } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { HttpErrorService } from '@app/services';
import { ReportService } from '@app/services/data';

@Component({
  selector: 'app-report-feed-entry-modal',
  templateUrl: './report-feed-entry-modal.component.html',
  styleUrls: ['./report-feed-entry-modal.component.scss'],
})
export class ReportFeedEntryModalComponent implements OnDestroy {
  open = false;

  feedEntryUuid = '';
  reason = '';

  closable = true;

  result = new Subject<void>();

  protected readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private reportService: ReportService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnDestroy() {
    this.result.complete();
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next();
    }

    this.open = open;
  }

  save() {
    this.closable = false;

    this.reportService
      .reportFeedEntry(this.feedEntryUuid, this.reason)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.closable = true;
            this.open = false;
          });

          this.result.next();
        },
        error: (error: unknown) => {
          this.zone.run(() => {
            this.closable = true;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }
}

export function openModal(
  feedEntryUuid: string,
  modal: ReportFeedEntryModalComponent,
) {
  modal.feedEntryUuid = feedEntryUuid;
  modal.reason = '';
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
