import {
  Component,
  NgZone,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, forkJoin } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import {
  FeedService,
  FeedEntryService,
  UserCategoryService,
} from '@app/services/data';
import { UserCategory, Feed } from '@app/models';
import {
  openModal as openUserCategoriesModal,
  ReturnData,
  UserCategoriesModalComponent,
} from '@app/routes/main/components/feed/user-categories-modal/user-categories-modal.component';
import { IApply } from '@app/services/data/usercategory.service';
import { Sort } from '@app/services/data/sort.interface';
import {
  AbstractFeedsComponent,
  DEFAULT_COUNT,
  FeedImpl as BaseFeedImpl,
} from '@app/routes/main/components/shared/abstract-feeds/abstract-feeds.component';
import { HttpErrorService } from '@app/services';

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
  userCategories: UserCategoryImpl[] = [];

  get feeds() {
    if (this.feed !== null) {
      return [this.feed];
    }

    throw new Error('feeds cannot be setup');
  }

  @ViewChild(UserCategoriesModalComponent, { static: true })
  private userCategoriesModal?: UserCategoriesModalComponent;

  constructor(
    private route: ActivatedRoute,
    private feedService: FeedService,
    private userCategoryService: UserCategoryService,

    zone: NgZone,
    changeDetectorRef: ChangeDetectorRef,
    feedEntryService: FeedEntryService,
    httpErrorService: HttpErrorService,
  ) {
    super(zone, changeDetectorRef, feedEntryService, httpErrorService);
  }

  ngOnInit() {
    super.ngOnInit();

    this.route.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: paramMap => {
        const url = paramMap.get('url');
        this.count = parseInt(
          paramMap.get('count') ?? DEFAULT_COUNT.toString(10),
          10,
        );

        if (url) {
          this.getFeed(url);
        }
      },
    });
  }

  private getFeed(url: string) {
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
      )
      .subscribe({
        next: feed => {
          this.zone.run(() => {
            this.feed = feed;
          });

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
            userCategoriesObservable = new Observable<UserCategoryImpl[]>(
              subscriber => {
                subscriber.next([]);
                subscriber.complete();
              },
            );
          }

          forkJoin([this.getFeedEntries(), userCategoriesObservable])
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: ([feedEntries, userCategories]) => {
                this.zone.run(() => {
                  this.feedEntries = feedEntries;
                  this.userCategories = userCategories;
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

  async onAddUserCategory() {
    if (this.userCategoriesModal === undefined) {
      throw new Error();
    }

    const returnData = await openUserCategoriesModal(
      new Set<string>(
        this.userCategories.map(userCategory => userCategory.text),
      ),
      this.userCategoriesModal,
    );
    if (returnData === undefined) {
      return;
    }

    if (this.feed !== null) {
      const applyBody: IApply = {};
      applyBody[this.feed.uuid] = new Set<string>(
        returnData.map(data => data.uuid),
      );

      this.userCategoryService
        .apply(applyBody)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.zone.run(() => {
              this.userCategories = returnData.map<UserCategoryImpl>(data => ({
                text: data.text,
              }));
            });
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }
}
