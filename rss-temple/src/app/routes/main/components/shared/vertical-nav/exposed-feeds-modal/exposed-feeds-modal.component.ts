import { Component, NgZone, OnDestroy } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

interface ExposedFeed {
  title: string;
  url: string;
}

@Component({
  selector: 'app-exposed-feeds-modal',
  templateUrl: './exposed-feeds-modal.component.html',
  styleUrls: ['./exposed-feeds-modal.component.scss'],
})
export class ExposedFeedsModalComponent implements OnDestroy {
  open = false;

  exposedFeeds: ExposedFeed[] = [];
  selectedExposedFeed: ExposedFeed | null = null;

  result = new Subject<string | null>();

  private readonly unsubscribe$ = new Subject<void>();

  constructor(private zone: NgZone) {}

  ngOnDestroy() {
    this.result.complete();

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next(null);
    }

    this.open = open;
  }

  onCancel() {
    this.result.next(
      this.selectedExposedFeed !== null ? this.selectedExposedFeed.url : null,
    );

    this.open = false;
  }

  onOk() {
    this.result.next(null);

    this.open = false;
  }
}

export function openModal(
  exposedFeeds: ExposedFeed[],
  modal: ExposedFeedsModalComponent,
) {
  modal.exposedFeeds = exposedFeeds;
  modal.selectedExposedFeed = null;
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
