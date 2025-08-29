import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { filter, map, mergeMap, startWith, takeUntil } from 'rxjs/operators';

import {
  InfoModalComponent,
  openModal as openInfoModal,
} from '@app/components/shared/info-modal/info-modal.component';
import { compare } from '@app/libs/compare.lib';
import { Feed, UserCategory } from '@app/models';
import {
  ExposedFeedsModalComponent,
  openModal as openExposedFeedsModal,
} from '@app/routes/main/components/shared/vertical-nav/exposed-feeds-modal/exposed-feeds-modal.component';
import {
  OPMLModalComponent,
  openModal as openOPMLModal,
} from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';
import {
  SubscribeModalComponent,
  openModal as openSubscribeModal,
} from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import {
  FeedObservableService,
  ReadCounterService,
  SubscribedFeedsFacadeService,
  UserCategoryObservableService,
} from '@app/routes/main/services';
import {
  AppAlertsService,
  HttpErrorService,
  ModalOpenService,
} from '@app/services';
import { FeedService, UserCategoryService } from '@app/services/data';
import { Sort } from '@app/services/data/sort.interface';

type UserCategoryImpl = Required<Pick<UserCategory, 'text' | 'feedUuids'>>;
type FeedImpl = Required<
  Pick<Feed, 'uuid' | 'calculatedTitle' | 'feedUrl' | 'homeUrl'>
>;
type FeedImpl2 = Required<
  Pick<Feed, 'uuid' | 'title' | 'isSubscribed' | 'homeUrl' | 'isDead'>
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
  standalone: false,
})
export class VerticalNavComponent implements OnInit, OnDestroy {
  private zone = inject(NgZone);
  private router = inject(Router);
  private feedService = inject(FeedService);
  private userCategoryService = inject(UserCategoryService);
  private feedObservableService = inject(FeedObservableService);
  private readCounterService = inject(ReadCounterService);
  private userCategoryObservableService = inject(UserCategoryObservableService);
  private appAlertsService = inject(AppAlertsService);
  private httpErrorService = inject(HttpErrorService);
  private modalOpenService = inject(ModalOpenService);
  private subscribedFeedsFacadeService = inject(SubscribedFeedsFacadeService);

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

  @ViewChild(ExposedFeedsModalComponent, { static: true })
  private exposedFeedsModal?: ExposedFeedsModalComponent;

  @ViewChild(InfoModalComponent, { static: true })
  private infoModal?: InfoModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

  get areCategoriesInUse() {
    return this.categorizedFeeds.category.some(c => c.feeds.length > 0);
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
    return compare(a.calculatedTitle, b.calculatedTitle);
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
      this.subscribedFeedsFacadeService.feeds$,
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
    const subscribeModal = this.subscribeModal;
    if (subscribeModal === undefined) {
      throw new Error();
    }

    const exposedFeedsModal = this.exposedFeedsModal;
    if (exposedFeedsModal === undefined) {
      throw new Error();
    }

    const infoModal = this.infoModal;
    if (infoModal === undefined) {
      throw new Error();
    }

    this.modalOpenService.openModal(async () => {
      const result = await openSubscribeModal(subscribeModal);

      if (result === undefined) {
        return;
      }

      this.feedService
        .lookupFeeds(result.feedUrl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: async exposedFeeds => {
            if (exposedFeeds.length < 1) {
              this.modalOpenService.openModal(async () => {
                await openInfoModal(
                  'No feed detected',
                  'Could not find feed exposed in supplied URL',
                  'danger',
                  infoModal,
                );
              });
            } else if (exposedFeeds.length == 1) {
              const onlyExposedFeed = exposedFeeds[0];
              if (onlyExposedFeed === undefined) {
                throw new Error('onlyExposedFeed undefined');
              }
              this.doFeedAdd(onlyExposedFeed.href, result.customTitle);
            } else {
              this.modalOpenService.openModal(async () => {
                const result_ = await openExposedFeedsModal(
                  exposedFeeds.map(ef => ({
                    url: ef.href,
                    title: ef.title,
                  })),
                  exposedFeedsModal,
                );

                if (result_ !== null) {
                  this.doFeedAdd(result_, result.customTitle);
                }
              });
            }
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    });
  }

  private doFeedAdd(feedUrl: string, customTitle: string | undefined) {
    this.feedService
      .get(feedUrl, {
        fields: ['uuid', 'title', 'isSubscribed', 'homeUrl', 'isDead'],
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        map(feed => feed as FeedImpl2),
        map(feed => {
          let title = feed.title.trim();
          if (title.length < 1) {
            title = '[No Title]';
          }
          feed.title = title;

          return feed;
        }),
        mergeMap(_feed => {
          let observables: [Observable<FeedImpl2>, Observable<void>];
          if (!_feed.isSubscribed) {
            observables = [
              of(_feed),
              this.feedService.subscribe(feedUrl, customTitle),
            ];
          } else {
            observables = [of(_feed), of()];
          }
          return forkJoin(observables);
        }),
      )
      .subscribe({
        next: ([_feed]) => {
          const feed: FeedImpl = {
            uuid: _feed.uuid,
            feedUrl: feedUrl,
            calculatedTitle:
              customTitle !== undefined ? customTitle : _feed.title,
            homeUrl: _feed.homeUrl,
          };

          this.feedObservableService.feedAdded.next(feed);

          this.zone.run(() => {
            this.categorizedFeeds.noCategory.feeds = [
              ...this.categorizedFeeds.noCategory.feeds,
              {
                uuid: feed.uuid,
                calculatedTitle: feed.calculatedTitle,
                feedUrl: feed.feedUrl,
                homeUrl: feed.homeUrl,
              },
            ];
            this.categorizedFeeds.noCategory.feeds.sort(
              VerticalNavComponent.sortFeeds,
            );
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
                key: null,
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
    const opmlModal = this.opmlModal;
    if (opmlModal === undefined) {
      throw new Error();
    }

    this.modalOpenService.openModal(async () => {
      await openOPMLModal(opmlModal);

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
            search: 'isSubscribed:"true"',
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
    });
  }
}
