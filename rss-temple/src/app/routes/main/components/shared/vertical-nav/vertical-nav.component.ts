import { Component, OnInit, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { forkJoin, Observable, of, Subject } from 'rxjs';
import { takeUntil, map, mergeMap, startWith, filter } from 'rxjs/operators';

import {
  openModal as openSubscribeModal,
  SubscribeModalComponent,
} from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import {
  openModal as openOPMLModal,
  OPMLModalComponent,
} from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';
import { FeedService, UserCategoryService } from '@app/services/data';
import {
  AppAlertsService,
  HttpErrorService,
  ModalOpenService,
} from '@app/services';
import {
  FeedObservableService,
  ReadCounterService,
  UserCategoryObservableService,
} from '@app/routes/main/services';
import { UserCategory, Feed } from '@app/models';
import { Sort } from '@app/services/data/sort.interface';
import { NavigationEnd, Router } from '@angular/router';

type UserCategoryImpl = Required<Pick<UserCategory, 'text' | 'feedUuids'>>;
type FeedImpl = Required<
  Pick<Feed, 'uuid' | 'calculatedTitle' | 'feedUrl' | 'homeUrl'>
>;
type FeedImpl2 = Required<
  Pick<Feed, 'uuid' | 'title' | 'subscribed' | 'homeUrl'>
>;

interface FeedDescriptor {
  uuid: string;
  calculatedTitle: string;
  feedUrl: string;
  homeUrl: string | null;
}

interface CategorizedFeeds {
  noCategory: {
    isExpanded: boolean;
    feeds: FeedDescriptor[];
  };
  category: {
    name: string;
    isExpanded: boolean;
    feeds: FeedDescriptor[];
  }[];
}

@Component({
  selector: 'app-vertical-nav',
  templateUrl: './vertical-nav.component.html',
  styleUrls: ['./vertical-nav.component.scss'],
})
export class VerticalNavComponent implements OnInit, OnDestroy {
  collapsed: boolean;

  categorizedFeeds: CategorizedFeeds = {
    noCategory: {
      isExpanded: false,
      feeds: [],
    },
    category: [],
  };

  get feedCounts$() {
    return this.readCounterService.feedCounts$;
  }

  @ViewChild(SubscribeModalComponent, { static: true })
  private subscribeModal?: SubscribeModalComponent;

  @ViewChild(OPMLModalComponent, { static: true })
  private opmlModal?: OPMLModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private router: Router,
    private feedService: FeedService,
    private userCategoryService: UserCategoryService,
    private feedObservableService: FeedObservableService,
    private readCounterService: ReadCounterService,
    private userCategoryObservableService: UserCategoryObservableService,
    private appAlertsService: AppAlertsService,
    private httpErrorService: HttpErrorService,
    private modalOpenService: ModalOpenService,
  ) {
    this.collapsed = window.innerWidth <= 800;
  }

  private static buildCategorizedFeeds(
    currentUrl: string,
    userCategories: UserCategoryImpl[],
    feeds: FeedImpl[],
  ) {
    currentUrl = decodeURIComponent(currentUrl);
    const categorizedFeedUuids = new Set<string>(
      userCategories.flatMap(uc => uc.feedUuids),
    );

    const noCategoryFeeds = feeds.filter(
      f => !categorizedFeedUuids.has(f.uuid),
    );

    return {
      noCategory: {
        isExpanded: noCategoryFeeds.some(
          f => currentUrl === `/main/feed/${f.feedUrl}`,
        ),
        feeds: noCategoryFeeds.map<FeedDescriptor>(f => ({
          uuid: f.uuid,
          calculatedTitle: f.calculatedTitle,
          feedUrl: f.feedUrl,
          homeUrl: f.homeUrl,
        })),
      },
      category: userCategories.map(uc => {
        const feedUuids = new Set<string>(uc.feedUuids);

        const categoryFeeds = feeds.filter(f => feedUuids.has(f.uuid));

        return {
          name: uc.text,
          isExpanded: categoryFeeds.some(
            f => currentUrl === `/main/feed/${f.feedUrl}`,
          ),
          feeds: categoryFeeds.map<FeedDescriptor>(f => ({
            uuid: f.uuid,
            calculatedTitle: f.calculatedTitle,
            feedUrl: f.feedUrl,
            homeUrl: f.homeUrl,
          })),
        };
      }),
    };
  }

  private static sortFeeds(a: FeedImpl, b: FeedImpl) {
    return a.calculatedTitle.localeCompare(b.calculatedTitle);
  }

  ngOnInit() {
    this.userCategoryObservableService.userCategoriesChanged$
      .pipe(takeUntil(this.unsubscribe$), startWith(undefined))
      .subscribe({
        next: () => {
          this.refresh();
        },
      });

    this.router.events
      .pipe(
        takeUntil(this.unsubscribe$),
        filter(navEvent => navEvent instanceof NavigationEnd),
      )
      .subscribe({
        next: navEvent => {
          const currentUrl = decodeURIComponent(
            (navEvent as NavigationEnd).url,
          );
          this.zone.run(() => {
            this.categorizedFeeds.noCategory.isExpanded =
              this.categorizedFeeds.noCategory.isExpanded ||
              this.categorizedFeeds.noCategory.feeds.some(
                f => currentUrl === `/main/feed/${f.feedUrl}`,
              );
            for (const category of this.categorizedFeeds.category) {
              category.isExpanded =
                category.isExpanded ||
                category.feeds.some(
                  f => currentUrl === `/main/feed/${f.feedUrl}`,
                );
            }
          });
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getTotalCount(feedCounts: Record<string, number>) {
    return Object.values(feedCounts).reduce(
      (previousValue, currentValue) => currentValue + previousValue,
      0,
    );
  }

  private refresh() {
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
          const categorizedFeeds = VerticalNavComponent.buildCategorizedFeeds(
            this.router.url,
            userCategories,
            feeds,
          );
          this.zone.run(() => {
            this.categorizedFeeds = categorizedFeeds;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  async addFeed() {
    if (this.subscribeModal === undefined) {
      throw new Error();
    }

    this.modalOpenService.isModalOpen$.next(true);
    const result = await openSubscribeModal(this.subscribeModal);
    this.modalOpenService.isModalOpen$.next(false);

    if (result === undefined) {
      return;
    }

    this.feedService
      .get(result.feedUrl, {
        fields: ['uuid', 'title', 'subscribed', 'homeUrl'],
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        map(feed => feed as FeedImpl2),
        mergeMap(_feed => {
          let observables: [Observable<FeedImpl2>, Observable<void>];
          if (!_feed.subscribed) {
            observables = [
              of(_feed),
              this.feedService.subscribe(result.feedUrl, result.customTitle),
            ];
          } else {
            observables = [of(_feed), of<void>()];
          }
          return forkJoin(observables);
        }),
      )
      .subscribe({
        next: ([_feed]) => {
          const feed: FeedImpl = {
            uuid: _feed.uuid,
            feedUrl: result.feedUrl,
            calculatedTitle:
              result.customTitle !== undefined
                ? result.customTitle
                : _feed.title,
            homeUrl: _feed.homeUrl,
          };

          this.feedObservableService.feedAdded.next(feed);

          this.zone.run(() => {
            this.categorizedFeeds.noCategory.feeds =
              this.categorizedFeeds.noCategory.feeds
                .concat({
                  uuid: feed.uuid,
                  calculatedTitle: feed.calculatedTitle,
                  feedUrl: feed.feedUrl,
                  homeUrl: feed.homeUrl,
                })
                .sort(VerticalNavComponent.sortFeeds);
          });
        },
        error: error => {
          let errorHandled = false;

          if (error instanceof HttpErrorResponse) {
            if (error.status === 422) {
              console.error('feed is malformed', error);
              this.appAlertsService.appAlertDescriptor$.next({
                autoCloseInterval: null,
                canClose: true,
                text: 'Feed is unable to be read. Please ensure URL points to a valid RSS/Atom feed.',
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
      throw new Error();
    }

    this.modalOpenService.isModalOpen$.next(true);
    await openOPMLModal(this.opmlModal);
    this.modalOpenService.isModalOpen$.next(false);

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
          const categorizedFeeds = VerticalNavComponent.buildCategorizedFeeds(
            this.router.url,
            userCategories,
            feeds,
          );
          this.zone.run(() => {
            this.categorizedFeeds = categorizedFeeds;
          });
        },
      });
  }
}
