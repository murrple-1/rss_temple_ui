import { Component, OnInit, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { forkJoin, Observable, of, Subject } from 'rxjs';
import { takeUntil, map, mergeMap, startWith } from 'rxjs/operators';

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
import {
  FeedObservableService,
  FeedCountsObservableService,
  UserCategoryObservableService,
} from '@app/routes/main/services';
import { UserCategory, Feed } from '@app/models';
import { Sort } from '@app/services/data/sort.interface';

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
  noCategory: FeedDescriptor[];
  category: {
    name: string;
    feeds: FeedDescriptor[];
  }[];
}

@Component({
  selector: 'app-vertical-nav',
  templateUrl: './vertical-nav.component.html',
  styleUrls: ['./vertical-nav.component.scss'],
})
export class VerticalNavComponent implements OnInit, OnDestroy {
  categorizedFeeds: CategorizedFeeds = {
    noCategory: [],
    category: [],
  };

  get feedCounts$() {
    return this.feedCountsObservableService.feedCounts$;
  }

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
    private feedCountsObservableService: FeedCountsObservableService,
    private userCategoryObservableService: UserCategoryObservableService,
    private appAlertsService: AppAlertsService,
    private httpErrorService: HttpErrorService,
  ) {}

  private static buildCategorizedFeeds(
    userCategories: UserCategoryImpl[],
    feeds: FeedImpl[],
  ) {
    const categorizedFeedUuids = new Set<string>(
      userCategories.flatMap(uc => uc.feedUuids),
    );

    return {
      noCategory: feeds
        .filter(f => !categorizedFeedUuids.has(f.uuid))
        .map<FeedDescriptor>(f => ({
          uuid: f.uuid,
          calculatedTitle: f.calculatedTitle,
          feedUrl: f.feedUrl,
          homeUrl: f.homeUrl,
        })),
      category: userCategories.map(uc => {
        const feedUuids = new Set<string>(uc.feedUuids);

        return {
          name: uc.text,
          feeds: feeds
            .filter(f => feedUuids.has(f.uuid))
            .map<FeedDescriptor>(f => ({
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

    const result = await openSubscribeModal(this.subscribeModal);
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
            this.categorizedFeeds.noCategory = this.categorizedFeeds.noCategory
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
      throw new Error();
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
          const categorizedFeeds = VerticalNavComponent.buildCategorizedFeeds(
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
