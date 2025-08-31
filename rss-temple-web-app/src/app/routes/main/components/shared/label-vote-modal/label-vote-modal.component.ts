import { Component, NgZone, OnDestroy, inject } from '@angular/core';
import {
  ClrDatagridModule,
  ClrModalModule,
  ClrPopoverHostDirective,
  ClrStopEscapePropagationDirective,
} from '@clr/angular';
import { Subject, firstValueFrom } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { ClassifierLabel } from '@app/models';
import { HttpErrorService } from '@app/services';
import { ClassifierLabelService } from '@app/services/data';

@Component({
  selector: 'app-label-vote-modal',
  templateUrl: './label-vote-modal.component.html',
  styleUrls: ['./label-vote-modal.component.scss'],
  imports: [
    ClrModalModule,
    ClrDatagridModule,
    ClrStopEscapePropagationDirective,
    ClrPopoverHostDirective,
  ],
})
export class LabelVoteModalComponent implements OnDestroy {
  private zone = inject(NgZone);
  private classifierLabelService = inject(ClassifierLabelService);
  private httpErrorService = inject(HttpErrorService);

  open = false;

  feedEntryUuid = '';
  classifierLabels: ClassifierLabel[] = [];
  selectedClassifierLabels: ClassifierLabel[] = [];

  closable = true;

  result = new Subject<void>();

  protected readonly unsubscribe$ = new Subject<void>();

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

    this.classifierLabelService
      .vote(
        this.feedEntryUuid,
        this.selectedClassifierLabels.map(cl => cl.uuid),
      )
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
  classifierLabels: ClassifierLabel[],
  selectedClassifierLabelIndexes: Iterable<number>,
  modal: LabelVoteModalComponent,
) {
  modal.feedEntryUuid = feedEntryUuid;
  const selectedClassifierLabelIndexesSet = new Set<number>(
    selectedClassifierLabelIndexes,
  );
  modal.classifierLabels = classifierLabels;
  modal.selectedClassifierLabels = classifierLabels.filter((_v, index) =>
    selectedClassifierLabelIndexesSet.has(index),
  );
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
