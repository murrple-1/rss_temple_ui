import {
  Component,
  NgZone,
  ChangeDetectorRef,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { combineLatest } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';

import { format } from 'date-fns';

import { FeedService, FeedEntryService } from '@app/services/data';
import { FeedObservableService } from '@app/routes/main/services';
import {
  AbstractFeedsComponent,
  DEFAULT_COUNT,
  FeedImpl as BaseFeedImpl,
  FeedEntryImpl as BaseFeedEntryImpl,
} from '@app/routes/main/components/shared/abstract-feeds/abstract-feeds.component';
import { HttpErrorService } from '@app/services';
import { Feed } from '@app/models';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';

type FeedImpl = BaseFeedImpl &
  Required<Pick<Feed, 'homeUrl' | 'calculatedTitle'>>;
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
    httpErrorService: HttpErrorService,
  ) {
    super(zone, changeDetectorRef, feedEntryService, httpErrorService);
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
    this.feedService
      .queryAll({
        fields: ['uuid', 'calculatedTitle', 'homeUrl'],
        search: 'subscribed:"true"',
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
      )
      .subscribe({
        next: feeds => {
          this.feeds = feeds;

          this.getFeedEntries()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: feedEntries => {
                if (this.startTime === null) {
                  this.startTime = feedEntries[0]?.publishedAt ?? null;
                }

                this.zone.run(() => {
                  this.feedEntries = feedEntries;
                });
              },
              error: error => {
                this.httpErrorService.handleError(error);
              },
            });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  protected feedEntryQueryOptions_search(_feeds: FeedImpl[]) {
    const searchParts: string[] = [];
    if (this.favoritesOnly) {
      searchParts.push('(isFavorite:"true")');
    } else {
      if (!this.showRead) {
        searchParts.push('(isRead:"false")');
      }
    }

    if (this.startTime !== null) {
      searchParts.push(
        `(publishedAt:"|${format(this.startTime, 'yyyy-MM-dd HH:mm:ss')}")`,
      );
    }

    return searchParts.join(' and ');
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
}
