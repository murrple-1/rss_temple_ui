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
  selector: 'app-report-feed-modal',
  templateUrl: './report-feed-modal.component.html',
  styleUrls: ['./report-feed-modal.component.scss'],
  standalone: false,
})
export class ReportFeedModalComponent implements OnDestroy {
  open = false;

  sendButtonState = ClrLoadingState.DEFAULT;
  readonly ClrLoadingState = ClrLoadingState;

  readonly reasonOptions: ReasonOption[] = [
    ...CommonReasonOptions,
    OtherReason,
  ];
  feedUuid = '';
  reasonOption = CommonReasonOptions[0]?.value ?? OtherReason.value;
  reason = '';

  result = new Subject<boolean>();

  @ViewChild('reportFeedForm', { static: true })
  _reportFeedForm?: NgForm;

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
    if (this._reportFeedForm === undefined) {
      throw new Error();
    }

    this.sendButtonState = ClrLoadingState.DEFAULT;
    this._reportFeedForm.resetForm({
      reasonOption: CommonReasonOptions[0]?.value ?? OtherReason.value,
      reason: '',
    });
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next(false);
    }

    this.open = open;
  }

  sendReport() {
    if (this._reportFeedForm?.invalid) {
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
      .reportFeed(this.feedUuid, reason)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.open = false;
          });

          this.result.next(true);
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

export function openModal(feedUuid: string, modal: ReportFeedModalComponent) {
  modal.feedUuid = feedUuid;
  modal.reset();
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
