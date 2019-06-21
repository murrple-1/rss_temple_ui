import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { zip } from 'rxjs';
import { takeUntil, map, take } from 'rxjs/operators';

import {
  FeedService,
  FeedEntryService,
  UserCategoryService,
} from '@app/services/data';
import { UserCategory } from '@app/models';
import {
  UserCategoriesModalComponent,
  ReturnData,
} from '@app/routes/main/components/feed/usercategoriesmodal/usercategoriesmodal.component';
import { IApply } from '@app/services/data/usercategory.service';
import { Sort } from '@app/services/data/sort.interface';
import {
  AbstractFeedsComponent,
  DEFAULT_COUNT,
  FeedImpl,
  FeedEntryImpl,
} from '@app/routes/main/components/shared/abstract-feeds/abstract-feeds.component';
import { HttpErrorService } from '@app/services';

interface FeedImpl2 extends FeedImpl {
  title: string;
  homeUrl: string | null;
  feedUrl: string;
  customTitle: string | null;
  subscribed: boolean;
  userCategoryUuids: string[];
  calculatedTitle: string;
}

interface UserCategoryImpl extends UserCategory {
  text: string;
}

@Component({
  templateUrl: 'feed.component.html',
  styleUrls: ['feed.component.scss'],
})
export class FeedComponent extends AbstractFeedsComponent {
  feed: FeedImpl | null = null;
  userCategories: UserCategoryImpl[] = [];

  private count = DEFAULT_COUNT;

  get feeds() {
    if (this.feed !== null) {
      return [this.feed];
    } else {
      return [];
    }
  }

  constructor(
    private route: ActivatedRoute,
    private modal: NgbModal,
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
        this.count = parseInt(paramMap.get('count') || '5', DEFAULT_COUNT);

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
        map(feed => feed as FeedImpl2),
      )
      .subscribe({
        next: feed => {
          feed.feedUrl = url;

          const feedEntryObservable = this.feedEntryService.query(
            this.feedEntryQueryOptions(this.count),
          );

          if (feed.userCategoryUuids.length > 0) {
            zip(
              feedEntryObservable,
              this.userCategoryService.queryAll({
                fields: ['text'],
                returnTotalCount: false,
                search: `uuid:"${feed.userCategoryUuids.join('|')}"`,
                sort: new Sort([['text', 'ASC']]),
              }),
            )
              .pipe(
                takeUntil(this.unsubscribe$),
                map(([feedEntries, userCategories]) => {
                  if (
                    feedEntries.objects !== undefined &&
                    userCategories.objects !== undefined
                  ) {
                    return [feedEntries.objects, userCategories.objects] as [
                      FeedEntryImpl[],
                      UserCategoryImpl[],
                    ];
                  }
                  throw new Error('malformed response');
                }),
              )
              .subscribe({
                next: ([feedEntries, userCategories]) => {
                  this.zone.run(() => {
                    this.feed = feed;
                    this.feedEntries = feedEntries;
                    this.userCategories = userCategories;
                  });
                },
                error: error => {
                  this.httpErrorService.handleError(error);
                },
              });
          } else {
            feedEntryObservable
              .pipe(
                takeUntil(this.unsubscribe$),
                map(feedEntries => {
                  if (feedEntries.objects !== undefined) {
                    return feedEntries.objects as FeedEntryImpl[];
                  }
                  throw new Error('malformed response');
                }),
              )
              .subscribe({
                next: feedEntries => {
                  this.zone.run(() => {
                    this.feed = feed;
                    this.feedEntries = feedEntries;
                    this.userCategories = [];
                  });
                },
                error: error => {
                  this.httpErrorService.handleError(error);
                },
              });
          }
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  onSubscribe() {
    if (this.feed && this.feed.feedUrl) {
      this.feedService
        .subscribe(this.feed.feedUrl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.zone.run(() => {
              if (this.feed !== null) {
                this.feed.subscribed = true;
              }
            });
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }

  onUnsubscribe() {
    if (this.feed && this.feed.feedUrl) {
      this.feedService
        .unsubscribe(this.feed.feedUrl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.zone.run(() => {
              if (this.feed !== null) {
                this.feed.subscribed = false;
              }
            });
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }

  onAddUserCategory() {
    const modalRef = this.modal.open(UserCategoriesModalComponent, {
      beforeDismiss: UserCategoriesModalComponent.beforeDismiss,
    });

    const component = modalRef.componentInstance as UserCategoriesModalComponent;
    component.initialUserCategories = new Set<string>(
      this.userCategories.map(userCategory => userCategory.text),
    );

    modalRef.result.then((returnData: ReturnData[]) => {
      if (this.feed !== null) {
        const applyBody: IApply = {};
        applyBody[this.feed.uuid] = new Set<string>(
          returnData.map(data => data.uuid),
        );

        this.userCategoryService
          .apply(applyBody)
          .pipe(
            takeUntil(this.unsubscribe$),
            take(1),
          )
          .subscribe({
            next: () => {
              this.zone.run(() => {
                this.userCategories = returnData.map<UserCategoryImpl>(data => {
                  return {
                    text: data.text,
                  };
                });
              });
            },
            error: error => {
              this.httpErrorService.handleError(error);
            },
          });
      }
    });
  }
}
