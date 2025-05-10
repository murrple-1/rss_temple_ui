import { Component, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ClrLoadingState } from '@clr/angular';
import { Subject, firstValueFrom } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import {
  CommonReasonOptions,
  OtherReason,
  ReasonOption,
} from '@app/routes/main/libs/report.lib';
import { HttpErrorService } from '@app/services';
import { ReportService } from '@app/services/data';

@Component({
  selector: 'app-report-feed-entry-modal',
  templateUrl: './report-feed-entry-modal.component.html',
  styleUrls: ['./report-feed-entry-modal.component.scss'],
  standalone: false,
})
export class ReportFeedEntryModalComponent implements OnDestroy {
  open = false;

  sendButtonState = ClrLoadingState.DEFAULT;
  readonly ClrLoadingState = ClrLoadingState;

  readonly reasonOptions: ReasonOption[] = [
    ...CommonReasonOptions,
    OtherReason,
  ];
  feedEntryUuid = '';
  reasonOption = CommonReasonOptions[0]?.value ?? OtherReason.value;
  reason = '';

  result = new Subject<void>();

  @ViewChild('reportFeedEntryForm', { static: true })
  _reportFeedEntryForm?: NgForm;

  protected readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private reportService: ReportService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnDestroy() {
    this.result.complete();
  }

  reset() {
    if (this._reportFeedEntryForm === undefined) {
      throw new Error();
    }

    this.sendButtonState = ClrLoadingState.DEFAULT;
    this._reportFeedEntryForm.resetForm({
      reasonOption: CommonReasonOptions[0]?.value ?? OtherReason.value,
      reason: '',
    });
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next();
    }

    this.open = open;
  }

  sendReport() {
    if (this._reportFeedEntryForm?.invalid) {
      return;
    }

    this.sendButtonState = ClrLoadingState.LOADING;

    let reason: string;
    if (this.reasonOption !== OtherReason.value) {
      reason = this.reasonOption;
    } else {
      reason = this.reason.trim();
    }

    this.reportService
      .reportFeedEntry(this.feedEntryUuid, reason)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.open = false;
          });

          this.result.next();
        },
        error: (error: unknown) => {
          this.zone.run(() => {
            this.sendButtonState = ClrLoadingState.DEFAULT;
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
  modal.reset();
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
