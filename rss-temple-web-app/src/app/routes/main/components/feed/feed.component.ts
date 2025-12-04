import { AsyncPipe } from '@angular/common';
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
  ClrIconModule,
  ClrInputModule,
  ClrPopoverHostDirective,
  ClrStopEscapePropagationDirective,
  ClrTooltipModule,
} from '@clr/angular';
import { Observable, combineLatest, forkJoin, of } from 'rxjs';
import { map, mergeMap, startWith, takeUntil, tap } from 'rxjs/operators';

import { Feed, UserCategory } from '@app/models';
import {
  ReportFeedModalComponent,
  openModal as openReportFeedModal,
} from '@app/routes/main/components/feed/report-feed-modal/report-feed-modal.component';
import {
  UserCategoriesModalComponent,
  openModal as openUserCategoriesModal,
} from '@app/routes/main/components/feed/user-categories-modal/user-categories-modal.component';
import {
  AbstractFeedsComponent,
  FeedImpl as BaseFeedImpl,
  DEFAULT_COUNT,
  LoadingState,
  NoLoadError,
} from '@app/routes/main/components/shared/abstract-feeds/abstract-feeds.component';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';
import { ReportFeedEntryModalComponent } from '@app/routes/main/components/shared/feed-entry-view/report-feed-entry-modal/report-feed-entry-modal.component';
import { FeedsFooterComponent } from '@app/routes/main/components/shared/feeds-footer/feeds-footer.component';
import { LabelVoteModalComponent } from '@app/routes/main/components/shared/label-vote-modal/label-vote-modal.component';
import { ShareModalComponent } from '@app/routes/main/components/shared/share-modal/share-modal.component';
import { VerticalNavComponent } from '@app/routes/main/components/shared/vertical-nav/vertical-nav.component';
import { InfiniteScrollDirective } from '@app/routes/main/directives/infinite-scroll.directive';
import { InViewportDirective } from '@app/routes/main/directives/inviewport.directive';
import { UserCategoryObservableService } from '@app/routes/main/services';
import { AppAlertsService } from '@app/services';
import { FeedService, UserCategoryService } from '@app/services/data';
import { Sort } from '@app/services/data/sort.interface';

type FeedImpl = BaseFeedImpl &
  Required<
    Pick<
      Feed,
      | 'title'
      | 'homeUrl'
      | 'feedUrl'
      | 'customTitle'
      | 'isSubscribed'
      | 'userCategoryUuids'
      | 'calculatedTitle'
      | 'isDead'
      | 'archivedCount'
    >
  >;
type UserCategoryImpl = Required<Pick<UserCategory, 'text'>>;

@Component({
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  imports: [
    VerticalNavComponent,
    InfiniteScrollDirective,
    ClrAccordionModule,
    ClrDatagridModule,
    ClrConditionalModule,
    ClrInputModule,
    ClrCommonFormsModule,
    FormsModule,
    ClrCheckboxModule,
    ClrIconModule,
    ClrStopEscapePropagationDirective,
    ClrPopoverHostDirective,
    ClrTooltipModule,
    FeedEntryViewComponent,
    InViewportDirective,
    FeedsFooterComponent,
    UserCategoriesModalComponent,
    ShareModalComponent,
    LabelVoteModalComponent,
    ReportFeedEntryModalComponent,
    ReportFeedModalComponent,
    AsyncPipe,
  ],
})
export class FeedComponent extends AbstractFeedsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private feedService = inject(FeedService);
  private userCategoryService = inject(UserCategoryService);
  private userCategoryObservableService = inject(UserCategoryObservableService);
  private appAlertService = inject(AppAlertsService);

  feed: FeedImpl | null = null;
  feedUrl: string | null = null;
  userCategories: UserCategoryImpl[] = [];

  showRead = false;

  customNameInput = '';
  isRenaming = false;

  feedSettingsOpen = false;

  archivedCount: number | null = null;

  get feeds() {
    if (this.feed !== null) {
      return [this.feed];
    } else {
      return [];
    }
  }

  get feedCounts$() {
    return this.readCounterService.feedCounts$;
  }

  @ViewChildren(FeedEntryViewComponent)
  protected feedEntryViews: QueryList<FeedEntryViewComponent> | undefined;

  @ViewChild('scrollContainer', { static: true })
  protected feedEntryViewsScollContainer: ElementRef<HTMLElement> | undefined;

  @ViewChild(UserCategoriesModalComponent, { static: true })
  private userCategoriesModal?: UserCategoriesModalComponent;

  @ViewChild(ReportFeedModalComponent, { static: true })
  private reportFeedModal?: ReportFeedModalComponent;

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
            const url = paramMap.get('url');
            this.count = parseInt(
              paramMap.get('count') ?? DEFAULT_COUNT.toString(10),
              10,
            );
            const showRead = paramMap.get('showRead') === 'true';

            if (url !== null) {
              this.feedUrl = url;
              this.zone.run(() => {
                this.feedSettingsOpen = false;
                this.showRead = showRead;
                this.reload();
              });
            } else {
              this.zone.run(() => {
                this.feedSettingsOpen = false;
                this.feed = null;
                this.feedEntries = [];
              });
            }
          }
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

    if (!this.showRead) {
      searchParts.push('(isRead:"false")');
    }

    if (searchParts.length > 0) {
      return searchParts.join(' and ');
    } else {
      return undefined;
    }
  }

  protected reload() {
    super.reload();

    this.feed = null;
    this.archivedCount = null;
    this.getFeed();
  }

  private getFeed() {
    const url = this.feedUrl;
    if (url === null) {
      return;
    }

    this.loadingState = LoadingState.IsLoading;

    const count = this.count;

    this.feedService
      .get(url, {
        fields: [
          'uuid',
          'title',
          'homeUrl',
          'customTitle',
          'isSubscribed',
          'userCategoryUuids',
          'calculatedTitle',
          'isDead',
          'archivedCount',
        ],
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        map(feed => {
          feed.feedUrl = url;
          return feed as FeedImpl;
        }),
        map(feed => {
          let title = feed.title.trim();
          if (title.length < 1) {
            title = '[No Title]';
          }
          feed.title = title;

          let customTitle =
            feed.customTitle !== null ? feed.customTitle.trim() : null;
          if (customTitle !== null && customTitle.length < 1) {
            customTitle = '[No Title]';
          }
          feed.customTitle = customTitle;

          let calculatedTitle = feed.calculatedTitle.trim();
          if (calculatedTitle.length < 1) {
            calculatedTitle = '[No Title]';
          }
          feed.calculatedTitle = calculatedTitle;

          return feed;
        }),
        tap(feed => {
          this.zone.run(() => {
            this.feed = feed;
          });
        }),
        mergeMap(feed => {
          let userCategoriesObservable: Observable<UserCategoryImpl[]>;
          if (feed.userCategoryUuids.length > 0) {
            userCategoriesObservable = this.userCategoryService
              .queryAll({
                fields: ['text'],
                returnTotalCount: false,
                search: `uuid:"${feed.userCategoryUuids.join(',')}"`,
                sort: new Sort([['text', 'ASC']]),
              })
              .pipe(
                map(userCategories => {
                  if (userCategories.objects !== undefined) {
                    return userCategories.objects as UserCategoryImpl[];
                  }
                  throw new Error('malformed response');
                }),
              );
          } else {
            userCategoriesObservable = of<UserCategoryImpl[]>([]);
          }

          return forkJoin([
            of(feed),
            this.getFeedEntries(),
            userCategoriesObservable,
          ]);
        }),
      )
      .subscribe({
        next: ([feed, feedEntries, userCategories]) => {
          this.zone.run(() => {
            this.customNameInput = feed.customTitle ?? '';

            this.feedEntries = feedEntries;
            this.userCategories = userCategories;

            if (feedEntries.length < count) {
              this.loadingState = LoadingState.NoMoreToLoad;
            } else {
              this.loadingState = LoadingState.IsNotLoading;
            }

            this.archivedCount = feed.archivedCount;
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

  onShowReadChange(showRead: boolean) {
    this.showRead = showRead;

    this.reload();
  }

  onSubscribe() {
    const feed = this.feed;
    if (feed !== null) {
      this.feedService
        .subscribe(feed.feedUrl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.zone.run(() => {
              feed.isSubscribed = true;
            });
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }

  onUnsubscribe() {
    const feed = this.feed;
    if (feed !== null) {
      this.feedService
        .unsubscribe(feed.feedUrl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.zone.run(() => {
              feed.isSubscribed = false;
            });
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }

  async onEditUserCategories() {
    const userCategoriesModal = this.userCategoriesModal;
    if (userCategoriesModal === undefined) {
      throw new Error();
    }

    const feed = this.feed;
    if (feed === null) {
      throw new Error();
    }

    this.modalOpenService.openModal(async () => {
      const returnData = await openUserCategoriesModal(
        feed.uuid,
        new Set<string>(
          this.userCategories.map(userCategory => userCategory.text),
        ),
        userCategoriesModal,
      );

      if (returnData !== undefined) {
        this.userCategories = returnData.categories.map<UserCategoryImpl>(
          c => ({
            text: c,
          }),
        );

        this.userCategoryObservableService.userCategoriesChanged$.next();
      }
    });
  }

  onFeedRename() {
    const feed = this.feed;
    if (feed === null) {
      throw new Error('feed null');
    }

    let customTitle: string | null = this.customNameInput.trim();
    if (customTitle.length < 1) {
      customTitle = null;
    }

    this.isRenaming = true;

    this.feedService
      .updateSubscriptions(feed.feedUrl, customTitle ?? undefined)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            feed.customTitle = customTitle;
            this.isRenaming = false;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);

          this.zone.run(() => {
            this.isRenaming = false;
          });
        },
      });
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

  report() {
    const reportFeedModal = this.reportFeedModal;
    if (reportFeedModal === undefined) {
      throw new Error('reportFeedModal undefined');
    }

    const feed = this.feed;
    if (feed === null) {
      throw new Error('feed null');
    }

    this.modalOpenService.openModal(async () => {
      const reportWasSent = await openReportFeedModal(
        feed.uuid,
        reportFeedModal,
      );
      if (reportWasSent) {
        this.appAlertService.appAlertDescriptor$.next({
          type: 'info',
          text: 'Thank you for the report!',
          canClose: true,
          autoCloseInterval: 5000,
          key: 'report-thank-you',
        });
      }
    });
  }
}
