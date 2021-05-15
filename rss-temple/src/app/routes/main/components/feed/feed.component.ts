import {
  Component,
  NgZone,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Observable, forkJoin, combineLatest, of } from 'rxjs';
import { takeUntil, map, startWith, mergeMap, tap } from 'rxjs/operators';

import {
  FeedService,
  FeedEntryService,
  UserCategoryService,
} from '@app/services/data';
import { UserCategory, Feed } from '@app/models';
import {
  openModal as openUserCategoriesModal,
  UserCategoriesModalComponent,
} from '@app/routes/main/components/feed/user-categories-modal/user-categories-modal.component';
import { Sort } from '@app/services/data/sort.interface';
import {
  AbstractFeedsComponent,
  DEFAULT_COUNT,
  FeedImpl as BaseFeedImpl,
  LoadingState,
} from '@app/routes/main/components/shared/abstract-feeds/abstract-feeds.component';
import { HttpErrorService } from '@app/services';
import {
  FeedCountsObservableService,
  ReadBufferService,
  UserCategoryObservableService,
} from '@app/routes/main/services';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';

type FeedImpl = BaseFeedImpl &
  Required<
    Pick<
      Feed,
      | 'title'
      | 'homeUrl'
      | 'feedUrl'
      | 'customTitle'
      | 'subscribed'
      | 'userCategoryUuids'
      | 'calculatedTitle'
    >
  >;
type UserCategoryImpl = Required<Pick<UserCategory, 'text'>>;

@Component({
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent extends AbstractFeedsComponent implements OnInit {
  feed: FeedImpl | null = null;
  feedUrl: string | null = null;
  userCategories: UserCategoryImpl[] = [];

  showRead = false;

  customNameInput = '';
  isRenaming = false;

  feedSettingsOpen = false;

  get feeds() {
    if (this.feed !== null) {
      return [this.feed];
    } else {
      return [];
    }
  }

  get feedCounts$() {
    return this.feedCountsObservableService.feedCounts$;
  }

  @ViewChildren(FeedEntryViewComponent)
  protected feedEntryViews: QueryList<FeedEntryViewComponent> | undefined;

  @ViewChild('scrollContainer', { static: true })
  protected feedEntryViewsScollContainer: ElementRef<HTMLElement> | undefined;

  @ViewChild(UserCategoriesModalComponent, { static: true })
  private userCategoriesModal?: UserCategoriesModalComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private feedService: FeedService,
    private userCategoryService: UserCategoryService,
    private userCategoryObservableService: UserCategoryObservableService,

    zone: NgZone,
    changeDetectorRef: ChangeDetectorRef,
    feedEntryService: FeedEntryService,
    feedCountsObservableService: FeedCountsObservableService,
    readBufferService: ReadBufferService,
    httpErrorService: HttpErrorService,
  ) {
    super(
      zone,
      changeDetectorRef,
      feedEntryService,
      feedCountsObservableService,
      readBufferService,
      httpErrorService,
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
    const searchParts: string[] = [];

    if (!this.showRead) {
      searchParts.push('(isRead:"false")');
    }

    if (feeds.length >= 1) {
      searchParts.push(
        `(feedUuid:"${feeds.map(feed => feed.uuid).join(',')}")`,
      );
    }

    if (searchParts.length > 0) {
      return searchParts.join(' and ');
    } else {
      return undefined;
    }
  }

  protected reload() {
    super.reload();

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
          'subscribed',
          'userCategoryUuids',
          'calculatedTitle',
        ],
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        map(feed => {
          feed.feedUrl = url;
          return feed as FeedImpl;
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
              feed.subscribed = true;
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
              feed.subscribed = false;
            });
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }

  async onEditUserCategories() {
    if (this.userCategoriesModal === undefined) {
      throw new Error();
    }

    if (this.feed === null) {
      throw new Error();
    }

    const returnData = await openUserCategoriesModal(
      this.feed.uuid,
      new Set<string>(
        this.userCategories.map(userCategory => userCategory.text),
      ),
      this.userCategoriesModal,
    );
    if (returnData !== undefined) {
      this.userCategories = returnData.categories.map<UserCategoryImpl>(c => ({
        text: c,
      }));

      this.userCategoryObservableService.userCategoriesChanged$.next();
    }
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
      .updateSubscriptions(feed.feedUrl, customTitle)
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

  readAll() {
    this.feedEntryService
      .readSome(
        undefined,
        this.feeds.map(f => f.uuid),
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.feedCountsObservableService.zero();

          this.zone.run(() => {
            this.reload();
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }
}
