import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  ClrAccordionModule,
  ClrCheckboxModule,
  ClrCommonFormsModule,
  ClrConditionalModule,
  ClrDatagridModule,
} from '@clr/angular';
import { combineLatest } from 'rxjs';
import { map, mergeMap, startWith, takeUntil, tap } from 'rxjs/operators';

import { Feed } from '@app/models';
import {
  AbstractFeedsComponent,
  FeedEntryImpl as BaseFeedEntryImpl,
  FeedImpl as BaseFeedImpl,
  DEFAULT_COUNT,
  LoadingState,
  NoLoadError,
} from '@app/routes/main/components/shared/abstract-feeds/abstract-feeds.component';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';
import {
  FeedObservableService,
  SubscribedFeedsFacadeService,
} from '@app/routes/main/services';

import { InfiniteScrollDirective } from '../../directives/infinite-scroll.directive';
import { InViewportDirective } from '../../directives/inviewport.directive';
import { FeedEntryViewComponent as FeedEntryViewComponent_1 } from '../shared/feed-entry-view/feed-entry-view.component';
import { ReportFeedEntryModalComponent } from '../shared/feed-entry-view/report-feed-entry-modal/report-feed-entry-modal.component';
import { FeedsFooterComponent } from '../shared/feeds-footer/feeds-footer.component';
import { LabelVoteModalComponent } from '../shared/label-vote-modal/label-vote-modal.component';
import { ShareModalComponent } from '../shared/share-modal/share-modal.component';
import { VerticalNavComponent } from '../shared/vertical-nav/vertical-nav.component';

type FeedImpl = BaseFeedImpl &
  Required<Pick<Feed, 'homeUrl' | 'calculatedTitle' | 'feedUrl'>>;
type FeedEntryImpl = BaseFeedEntryImpl;

@Component({
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss'],
  imports: [
    VerticalNavComponent,
    InfiniteScrollDirective,
    ClrAccordionModule,
    ClrDatagridModule,
    ClrConditionalModule,
    ClrCheckboxModule,
    FormsModule,
    ClrCommonFormsModule,
    FeedEntryViewComponent_1,
    InViewportDirective,
    FeedsFooterComponent,
    ShareModalComponent,
    LabelVoteModalComponent,
    ReportFeedEntryModalComponent,
  ],
})
export class FeedsComponent extends AbstractFeedsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private feedObservableService = inject(FeedObservableService);
  private subscribedFeedsFacadeService = inject(SubscribedFeedsFacadeService);

  feeds: FeedImpl[] = [];

  favoritesOnly = false;
  showRead = false;

  @ViewChildren(FeedEntryViewComponent)
  protected feedEntryViews: QueryList<FeedEntryViewComponent> | undefined;

  @ViewChild('scrollContainer', { static: true })
  protected feedEntryViewsScollContainer: ElementRef<HTMLElement> | undefined;

  ngOnInit() {
    combineLatest([
      this.route.paramMap.pipe(startWith(undefined)),
      this.router.events.pipe(startWith(undefined)),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([paramMap, navigationEvent]) => {
          if (
            paramMap !== undefined &&
            (navigationEvent === undefined ||
              navigationEvent instanceof NavigationEnd)
          ) {
            this.count = parseInt(
              paramMap.get('count') ?? DEFAULT_COUNT.toString(10),
              10,
            );
            const favoritesOnly = paramMap.get('favorites') === 'true';
            const showRead = paramMap.get('showRead') === 'true';

            this.zone.run(() => {
              this.favoritesOnly = favoritesOnly;
              this.showRead = showRead;
              this.reload();
            });
          }
        },
      });

    this.feedObservableService.feedAdded
      .pipe(
        takeUntil(this.unsubscribe$),
        map(feed => feed as FeedImpl),
      )
      .subscribe({
        next: feed => {
          this.feeds.push(feed);

          this.zone.run(() => {
            this.reload();
          });
        },
      });

    this.feedObservableService.feedRemoved
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feed => {
          this.feeds = this.feeds.filter(f => f.uuid !== feed.uuid);

          this.zone.run(() => {
            this.reload();
          });
        },
      });

    this.feedObservableService.feedsChanged
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: this.getFeeds.bind(this),
      });
  }

  private getFeeds() {
    this.loadingState = LoadingState.IsLoading;

    const count = this.count;
    this.subscribedFeedsFacadeService.feeds$
      .pipe(
        tap(feeds => {
          this.feeds = feeds;
        }),
        mergeMap(() => this.getFeedEntries()),
      )
      .subscribe({
        next: feedEntries => {
          this.zone.run(() => {
            if (feedEntries.length < count) {
              this.loadingState = LoadingState.NoMoreToLoad;
            } else {
              this.loadingState = LoadingState.IsNotLoading;
            }

            this.feedEntries = feedEntries;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);

          this.zone.run(() => {
            this.loadingState = LoadingState.NoMoreToLoad;
          });
        },
      });
  }

  protected feedEntryCreateStableQueryOptions_search(feeds: FeedImpl[]) {
    if (feeds.length < 1) {
      throw new NoLoadError();
    }

    const searchParts = [
      `(feedUuid:"${feeds.map(feed => feed.uuid).join(',')}")`,
    ];

    if (this.favoritesOnly) {
      searchParts.push('(isFavorite:"true")');
    } else {
      if (!this.showRead) {
        searchParts.push('(isRead:"false")');
      }
    }

    if (searchParts.length > 0) {
      return searchParts.join(' and ');
    } else {
      return undefined;
    }
  }

  protected reload() {
    super.reload();

    this.getFeeds();
  }

  findFeed(feedEntry: FeedEntryImpl) {
    const feed = this.feeds.find(_feed => _feed.uuid === feedEntry.feedUuid);
    return feed;
  }

  onShowReadChange(showRead: boolean) {
    this.showRead = showRead;

    this.reload();
  }

  feedAdded(feed: FeedImpl) {
    this.feeds.push(feed);

    this.zone.run(() => {
      this.reload();
    });
  }

  opmlUploaded() {
    this.getFeeds();
  }

  async readAll() {
    try {
      this.feedEntries = [];
      this.loadingState = LoadingState.IsLoading;
      await this.readCounterService.readAll(this.feeds.map(f => f.uuid));
      this.reload();
    } catch (reason) {
      this.httpErrorService.handleError(reason);
    }
  }
}
