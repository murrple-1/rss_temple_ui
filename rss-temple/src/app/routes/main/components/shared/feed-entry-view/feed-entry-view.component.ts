import { Component, Input, NgZone, OnDestroy, ElementRef } from '@angular/core';

import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeedEntryService } from '@app/services/data';
import { FeedEntry, Feed } from '@app/models';
import { DisplayObservableService } from '@app/routes/main/services';
import { DisplayType } from '@app/routes/main/services/display-observable.service';

type FeedImpl = Required<Pick<Feed, 'calculatedTitle' | 'homeUrl'>>;
type FeedEntryImpl = Required<
  Pick<
    FeedEntry,
    | 'uuid'
    | 'url'
    | 'title'
    | 'content'
    | 'isRead'
    | 'isFavorite'
    | 'authorName'
    | 'publishedAt'
  >
>;

@Component({
  selector: 'app-feed-entry-view',
  templateUrl: './feed-entry-view.component.html',
  styleUrls: ['./feed-entry-view.component.scss'],
})
export class FeedEntryViewComponent implements OnDestroy {
  readonly DisplayType = DisplayType;

  display: Observable<DisplayType>;

  @Input()
  feed?: FeedImpl;

  @Input()
  feedEntry?: FeedEntryImpl;

  flashing = false;

  private hasAutoRead = false;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private elementRef: ElementRef,
    private feedEntryService: FeedEntryService,

    displayObservableService: DisplayObservableService,
  ) {
    this.display = displayObservableService.display;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  read() {
    if (this.feedEntry === undefined) {
      return;
    }

    this.feedEntryService
      .read(this.feedEntry.uuid)
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

  autoRead() {
    if (this.feedEntry === undefined) {
      return;
    }

    if (!this.hasAutoRead) {
      if (!this.feedEntry.isRead) {
        this.read();
      }

      this.hasAutoRead = true;
    }
  }

  unread() {
    if (this.feedEntry === undefined) {
      return;
    }

    this.feedEntryService
      .unread(this.feedEntry.uuid)
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
      .favorite(this.feedEntry.uuid)
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
      .unfavorite(this.feedEntry.uuid)
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

  onClick(event: MouseEvent) {
    const ref = this.elementRef.nativeElement as HTMLElement;
    const ignoreClickNodes = Array.from<HTMLElement>(
      ref.querySelectorAll('button'),
    );

    if (!ignoreClickNodes.includes(event.target as HTMLElement)) {
      this.flashing = false;

      window.setTimeout(() => {
        this.flashing = true;
      }, 300);
    }
  }
}
