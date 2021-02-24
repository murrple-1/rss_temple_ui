import { Component, OnInit, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { forkJoin, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import {
  openModal as openSubscribeModal,
  SubscribeModalComponent,
} from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import {
  openModal as openOPMLModal,
  OPMLModalComponent,
} from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';
import { FeedService, UserCategoryService } from '@app/services/data';
import { AppAlertsService, HttpErrorService } from '@app/services';
import { FeedObservableService } from '@app/routes/main/services';
import { UserCategory, Feed } from '@app/models';
import { Sort } from '@app/services/data/sort.interface';

type UserCategoryImpl = Required<Pick<UserCategory, 'text' | 'feedUuids'>>;
type FeedImpl = Required<
  Pick<Feed, 'uuid' | 'calculatedTitle' | 'feedUrl' | 'homeUrl'>
>;
type FeedImpl2 = Required<
  Pick<Feed, 'uuid' | 'title' | 'subscribed' | 'homeUrl'>
>;

interface CategorizedFeeds {
  noCategory: FeedImpl[];
  category: {
    name: string;
    feeds: FeedImpl[];
  }[];
}

@Component({
  selector: 'app-vertical-nav',
  templateUrl: './vertical-nav.component.html',
  styleUrls: ['./vertical-nav.component.scss'],
})
export class VerticalNavComponent implements OnInit, OnDestroy {
  filterText = '';
  searchAllText = '';
  isCollapsed = false;

  private allCategorizedFeeds: CategorizedFeeds = {
    noCategory: [],
    category: [],
  };
  filteredCategorizedFeeds: CategorizedFeeds = {
    noCategory: [],
    category: [],
  };

  @ViewChild(SubscribeModalComponent, { static: true })
  private subscribeModal?: SubscribeModalComponent;

  @ViewChild(OPMLModalComponent, { static: true })
  private opmlModal?: OPMLModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private feedService: FeedService,
    private userCategoryService: UserCategoryService,
    private feedObservableService: FeedObservableService,
    private appAlertsService: AppAlertsService,
    private httpErrorService: HttpErrorService,
  ) {}

  private static buildAllCategorizedFeeds(
    userCategories: UserCategoryImpl[],
    feeds: FeedImpl[],
  ) {
    const allCategorizedFeedUuids = new Set<string>(
      userCategories.flatMap(_userCategory => {
        if (_userCategory.feedUuids !== undefined) {
          return _userCategory.feedUuids;
        } else {
          return [];
        }
      }),
    );

    const allCategorizedFeeds: CategorizedFeeds = {
      noCategory: feeds.filter(_feed => {
        if (_feed.uuid !== undefined) {
          return !allCategorizedFeedUuids.has(_feed.uuid);
        } else {
          return false;
        }
      }),
      category: [],
    };

    for (const userCategory of userCategories) {
      if (
        userCategory.text !== undefined &&
        userCategory.feedUuids !== undefined
      ) {
        const feedUuids = new Set<string>(userCategory.feedUuids);

        allCategorizedFeeds.category.push({
          name: userCategory.text,
          feeds: feeds.filter(_feed => {
            if (_feed.uuid !== undefined) {
              return feedUuids.has(_feed.uuid);
            } else {
              return false;
            }
          }),
        });
      }
    }

    return allCategorizedFeeds;
  }

  private static sortFeeds(a: FeedImpl, b: FeedImpl) {
    if (a.calculatedTitle !== undefined) {
      if (b.calculatedTitle !== undefined) {
        return a.calculatedTitle.localeCompare(b.calculatedTitle);
      } else {
        return 1;
      }
    } else {
      return -1;
    }
  }

  ngOnInit() {
    forkJoin([
      this.userCategoryService
        .queryAll({
          fields: ['text', 'feedUuids'],
          sort: new Sort([['text', 'ASC']]),
          returnTotalCount: false,
        })
        .pipe(
          map(response => {
            if (response.objects !== undefined) {
              return response.objects as UserCategoryImpl[];
            }
            throw new Error('malformed response');
          }),
        ),
      this.feedService
        .queryAll({
          fields: ['uuid', 'calculatedTitle', 'feedUrl', 'homeUrl'],
          search: 'subscribed:"true"',
          sort: new Sort([['calculatedTitle', 'ASC']]),
          returnTotalCount: false,
        })
        .pipe(
          map(response => {
            if (response.objects !== undefined) {
              return response.objects as FeedImpl[];
            }
            throw new Error('malformed response');
          }),
        ),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([userCategories, feeds]) => {
          const allCategorizedFeeds = VerticalNavComponent.buildAllCategorizedFeeds(
            userCategories,
            feeds,
          );
          this.zone.run(() => {
            this.allCategorizedFeeds = allCategorizedFeeds;
            this.filteredCategorizedFeeds = allCategorizedFeeds;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async addFeed() {
    if (this.subscribeModal === undefined) {
      throw new Error('subscribeModal undefined');
    }

    const result = await openSubscribeModal(this.subscribeModal);

    this.feedService
      .get(result.feedUrl, {
        fields: ['uuid', 'title', 'subscribed', 'homeUrl'],
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        map(feed => feed as FeedImpl2),
      )
      .subscribe({
        next: _feed => {
          const feed: FeedImpl = {
            uuid: _feed.uuid,
            feedUrl: result.feedUrl,
            calculatedTitle: _feed.title,
            homeUrl: _feed.homeUrl,
          };
          if (!_feed.subscribed) {
            this.feedService
              .subscribe(result.feedUrl, result.customTitle)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe({
                next: () => {
                  if (result.customTitle !== undefined) {
                    feed.calculatedTitle = result.customTitle;
                  }

                  this.zone.run(() => {
                    this.feedObservableService.feedAdded.next(feed);

                    this.allCategorizedFeeds.noCategory = this.allCategorizedFeeds.noCategory
                      .concat(feed)
                      .sort(VerticalNavComponent.sortFeeds);

                    this.filterFeeds();
                  });
                },
                error: error => {
                  this.httpErrorService.handleError(error);
                },
              });
          } else {
            // TODO already subscribed. do anything?
          }
        },
        error: error => {
          let errorHandled = false;

          if (error instanceof HttpErrorResponse) {
            if (error.status === 422) {
              console.error('feed is malformed', error);
              this.appAlertsService.appAlertDescriptor$.next({
                autoCloseInterval: null,
                canClose: true,
                text:
                  'Feed is unable to be read. Please ensure URL points to a valid RSS/Atom feed.',
                type: 'danger',
              });
              errorHandled = true;
            }
          }

          if (!errorHandled) {
            this.httpErrorService.handleError(error);
          }
        },
      });
  }

  async uploadOPML() {
    if (this.opmlModal === undefined) {
      throw new Error('opmlModal undefined');
    }

    await openOPMLModal(this.opmlModal);

    this.feedObservableService.feedsChanged.next();

    forkJoin([
      this.userCategoryService
        .queryAll({
          fields: ['text', 'feedUuids'],
          sort: new Sort([['text', 'ASC']]),
          returnTotalCount: false,
        })
        .pipe(
          map(response => {
            if (response.objects !== undefined) {
              return response.objects as UserCategoryImpl[];
            }
            throw new Error('malformed response');
          }),
        ),
      this.feedService
        .queryAll({
          fields: ['uuid', 'calculatedTitle', 'feedUrl', 'homeUrl'],
          search: 'subscribed:"true"',
          sort: new Sort([['calculatedTitle', 'ASC']]),
          returnTotalCount: false,
        })
        .pipe(
          map(response => {
            if (response.objects !== undefined) {
              return response.objects as FeedImpl[];
            }
            throw new Error('malformed response');
          }),
        ),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([userCategories, feeds]) => {
          this.zone.run(() => {
            this.allCategorizedFeeds = VerticalNavComponent.buildAllCategorizedFeeds(
              userCategories,
              feeds,
            );

            this.filterFeeds();
          });
        },
      });
  }

  setFilterText(filterText: string) {
    this.filterText = filterText;
    this.filterFeeds();
  }

  private filterFeeds() {
    const filterText = this.filterText.trim().toLowerCase();

    const filterFn = (feed: FeedImpl) => {
      if (feed.calculatedTitle !== undefined) {
        return feed.calculatedTitle.toLowerCase().includes(filterText);
      } else {
        return false;
      }
    };

    const filteredCategorizedFeeds: CategorizedFeeds = {
      noCategory: this.allCategorizedFeeds.noCategory.filter(filterFn),
      category: [],
    };

    for (const category of this.allCategorizedFeeds.category) {
      filteredCategorizedFeeds.category.push({
        name: category.name,
        feeds: category.feeds.filter(filterFn),
      });
    }

    this.filteredCategorizedFeeds = filteredCategorizedFeeds;
  }

  onSearch() {
    // TODO searching?
    console.log(this.searchAllText);
  }
}
