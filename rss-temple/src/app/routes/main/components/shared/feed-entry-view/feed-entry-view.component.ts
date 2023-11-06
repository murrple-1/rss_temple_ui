import { Component, ElementRef, Input, NgZone, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';

import { compare } from '@app/libs/compare.lib';
import { ClassifierLabel, Feed } from '@app/models';
import { FeedEntryImpl } from '@app/routes/main/components/shared/abstract-feeds/abstract-feeds.component';
import {
  LabelVoteModalComponent,
  openModal as openLabelVoteModal,
} from '@app/routes/main/components/shared/label-vote-modal/label-vote-modal.component';
import {
  ShareModalComponent,
  openModal as openShareModal,
} from '@app/routes/main/components/shared/share-modal/share-modal.component';
import {
  FeedEntryVoteService,
  ReadCounterService,
} from '@app/routes/main/services';
import { HttpErrorService } from '@app/services';
import { ClassifierLabelService, FeedEntryService } from '@app/services/data';

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

  @Input()
  shareModalComponent?: ShareModalComponent;

  @Input()
  labelVoteModalComponent?: LabelVoteModalComponent;

  flashing = false;

  isClassifierLabelDismissed = false;

  private hasAutoRead = false;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    public elementRef: ElementRef<HTMLElement>,
    private feedEntryService: FeedEntryService,
    private readCounterService: ReadCounterService,
    private classifierLabelService: ClassifierLabelService,
    private httpErrorService: HttpErrorService,
    private feedEntryVoteService: FeedEntryVoteService,
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
        error: (error: unknown) => {
          this.httpErrorService.handleError(error);
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
        error: (error: unknown) => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  async share() {
    if (this.shareModalComponent === undefined) {
      throw new Error('shareModalComponent undefined');
    }

    if (this.feedEntry === undefined) {
      return;
    }

    await openShareModal(
      this.feedEntry.url,
      this.feedEntry.title,
      this.shareModalComponent,
    );
  }

  voteYes() {
    this.isClassifierLabelDismissed = true;

    const feedEntry = this.feedEntry;
    if (feedEntry === undefined) {
      return;
    }

    const possibleClassifierLabel = feedEntry.possibleClassifierLabel;
    if (possibleClassifierLabel === null) {
      return;
    }

    this.feedEntryVoteService.forceHide(feedEntry.uuid);

    this.classifierLabelService
      .getMyVotes(feedEntry.uuid)
      .pipe(
        mergeMap(votes => {
          const voteUuids = new Set(votes.map(v => v.uuid));
          voteUuids.add(possibleClassifierLabel.uuid);
          return this.classifierLabelService.vote(
            feedEntry.uuid,
            Array.from(voteUuids),
          );
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe({
        error: (error: unknown) => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  voteNo() {
    this.isClassifierLabelDismissed = true;

    if (this.feedEntry === undefined) {
      return;
    }
    this.feedEntryVoteService.forceHide(this.feedEntry.uuid);
  }

  private sortClassifierLabels(a: ClassifierLabel, b: ClassifierLabel) {
    return compare(a.text, b.text);
  }

  voteLabels() {
    const labelVoteModalComponent = this.labelVoteModalComponent;
    if (labelVoteModalComponent === undefined) {
      throw new Error('labelVoteModalComponent undefined');
    }

    const feedEntry = this.feedEntry;
    if (feedEntry === undefined) {
      return;
    }

    forkJoin([
      this.classifierLabelService.getAll(feedEntry.uuid),
      this.classifierLabelService.getMyVotes(feedEntry.uuid),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: async ([classifierLabels, votes]) => {
          classifierLabels.sort(this.sortClassifierLabels);

          const votedLabelIndexes = new Set<number>();
          for (const vote of votes) {
            const index = classifierLabels.findIndex(
              cl => cl.uuid === vote.uuid,
            );
            if (index > -1) {
              votedLabelIndexes.add(index);
            }
          }
          await openLabelVoteModal(
            feedEntry.uuid,
            classifierLabels,
            votedLabelIndexes,
            labelVoteModalComponent,
          );
        },
        error: (error: unknown) => {
          this.httpErrorService.handleError(error);
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
