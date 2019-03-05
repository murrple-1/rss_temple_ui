import { Component, Input, NgZone, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeedEntry } from '@app/_models';
import { FeedEntryService } from '@app/_services/data';

@Component({
  selector: 'rsst-feed-entry-view',
  templateUrl: './feed-entry-view.component.html',
  styleUrls: ['./feed-entry-view.component.scss'],
})
export class FeedEntryViewComponent implements OnDestroy {
  @Input()
  feedEntry!: FeedEntry;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private feedEntryService: FeedEntryService,
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  read() {
    this.feedEntryService
      .read(this.feedEntry)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.feedEntry.isRead = true;
          });
        },
        error: error => {
          console.log(error);
        },
      });
  }

  unread() {
    this.feedEntryService
      .unread(this.feedEntry)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.feedEntry.isRead = false;
          });
        },
        error: error => {
          console.log(error);
        },
      });
  }

  favorite() {
    this.feedEntryService
      .favorite(this.feedEntry)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.feedEntry.isFavorite = true;
          });
        },
        error: error => {
          console.log(error);
        },
      });
  }

  unfavorite() {
    this.feedEntryService
      .unfavorite(this.feedEntry)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.feedEntry.isFavorite = false;
          });
        },
        error: error => {
          console.log(error);
        },
      });
  }
}
