import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
  FeedEntryVoteService,
  FeedObservableService,
  ReadCounterService,
} from '@app/routes/main/services';
import { HttpErrorService, ModalOpenService } from '@app/services';
import {
  ClassifierLabelService,
  FeedEntryService,
  FeedService,
} from '@app/services/data';

type FeedImpl = BaseFeedImpl &
  Required<Pick<Feed, 'homeUrl' | 'calculatedTitle' | 'feedUrl'>>;
type FeedEntryImpl = BaseFeedEntryImpl;

@Component({
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss'],
})
export class FeedsComponent extends AbstractFeedsComponent implements OnInit {
  feeds: FeedImpl[] = [];

  favoritesOnly = false;
  showRead = false;

  @ViewChildren(FeedEntryViewComponent)
  protected feedEntryViews: QueryList<FeedEntryViewComponent> | undefined;

  @ViewChild('scrollContainer', { static: true })
  protected feedEntryViewsScollContainer: ElementRef<HTMLElement> | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private feedService: FeedService,
    private feedObservableService: FeedObservableService,

    zone: NgZone,
    changeDetectorRef: ChangeDetectorRef,
    feedEntryService: FeedEntryService,
    readCounterService: ReadCounterService,
    classifierLabelService: ClassifierLabelService,
    httpErrorService: HttpErrorService,
    modalOpenService: ModalOpenService,
    feedEntryVoteService: FeedEntryVoteService,
  ) {
    super(
      zone,
      changeDetectorRef,
      feedEntryService,
      readCounterService,
      classifierLabelService,
      httpErrorService,
      modalOpenService,
      feedEntryVoteService,
    );
  }

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
    this.feedService
      .queryAll({
        fields: ['uuid', 'calculatedTitle', 'homeUrl', 'feedUrl'],
        search: 'isSubscribed:"true"',
        returnTotalCount: false,
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        map(feeds => {
          if (feeds.objects !== undefined) {
            return feeds.objects as FeedImpl[];
          }
          throw new Error('malformed response');
        }),
        map(feeds => {
          for (const feed of feeds) {
            let calculatedTitle = feed.calculatedTitle.trim();
            if (calculatedTitle.length < 1) {
              calculatedTitle = '[No Title]';
            }
            feed.calculatedTitle = calculatedTitle;
          }
          return feeds;
        }),
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
