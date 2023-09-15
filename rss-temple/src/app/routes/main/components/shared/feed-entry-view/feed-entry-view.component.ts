import { Component, ElementRef, Input, NgZone, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Feed } from '@app/models';
import { FeedEntryImpl } from '@app/routes/main/components/shared/abstract-feeds/abstract-feeds.component';
import { ReadCounterService } from '@app/routes/main/services';
import { FeedEntryService } from '@app/services/data';

type FeedImpl = Required<Pick<Feed, 'calculatedTitle' | 'homeUrl' | 'feedUrl'>>;

@Component({
  selector: 'app-feed-entry-view',
  templateUrl: './feed-entry-view.component.html',
  styleUrls: ['./feed-entry-view.component.scss'],
})
export class FeedEntryViewComponent implements OnDestroy {
  @Input()
  feed?: FeedImpl;

  @Input()
  feedEntry?: FeedEntryImpl;

  @Input()
  hasFocus = false;

  @Input()
  isGoToVisible = false;

  flashing = false;

  readonly isShareAvailable = Boolean(navigator.share);

  private hasAutoRead = false;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    public elementRef: ElementRef<HTMLElement>,
    private feedEntryService: FeedEntryService,
    private readCounterService: ReadCounterService,
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  read() {
    const feedEntry = this.feedEntry;
    if (feedEntry === undefined) {
      return;
    }
    feedEntry.isRead = true;
    this.readCounterService.markRead(feedEntry);
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
    const feedEntry = this.feedEntry;
    if (feedEntry === undefined) {
      return;
    }

    feedEntry.isRead = false;
    this.readCounterService.markUnread(feedEntry);
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

  async share() {
    if (this.feedEntry === undefined) {
      return;
    }

    if (!navigator.share) {
      return;
    }

    try {
      await navigator.share({
        url: this.feedEntry.url,
        title: this.feedEntry.title,
      });
    } catch (err: unknown) {
      console.error(err);
    }
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
