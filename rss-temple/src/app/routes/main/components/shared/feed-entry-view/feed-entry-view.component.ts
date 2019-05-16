import { Component, Input, NgZone, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeedEntryService } from '@app/services/data';
import { FeedEntry } from '@app/models';

interface FeedEntryImpl extends FeedEntry {
  url: string;
  title: string;
  content: string;
  isRead: boolean;
  isFavorite: boolean;
}

@Component({
  selector: 'app-feed-entry-view',
  templateUrl: './feed-entry-view.component.html',
  styleUrls: ['./feed-entry-view.component.scss'],
})
export class FeedEntryViewComponent implements OnDestroy {
  @Input()
  feedEntry?: FeedEntryImpl;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private feedEntryService: FeedEntryService,
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  read() {
    if (this.feedEntry === undefined) {
      return;
    }

    this.feedEntryService
      .read(this.feedEntry)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            if (this.feedEntry !== undefined) {
              this.feedEntry.isRead = true;
            }
          });
        },
        error: error => {
          console.log(error);
        },
      });
  }

  unread() {
    if (this.feedEntry === undefined) {
      return;
    }

    this.feedEntryService
      .unread(this.feedEntry)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            if (this.feedEntry !== undefined) {
              this.feedEntry.isRead = false;
            }
          });
        },
        error: error => {
          console.log(error);
        },
      });
  }

  favorite() {
    if (this.feedEntry === undefined) {
      return;
    }

    this.feedEntryService
      .favorite(this.feedEntry)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            if (this.feedEntry !== undefined) {
              this.feedEntry.isFavorite = true;
            }
          });
        },
        error: error => {
          console.log(error);
        },
      });
  }

  unfavorite() {
    if (this.feedEntry === undefined) {
      return;
    }

    this.feedEntryService
      .unfavorite(this.feedEntry)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            if (this.feedEntry !== undefined) {
              this.feedEntry.isFavorite = false;
            }
          });
        },
        error: error => {
          console.log(error);
        },
      });
  }
}
