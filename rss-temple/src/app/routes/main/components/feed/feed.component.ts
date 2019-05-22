import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject, zip } from 'rxjs';
import { takeUntil, map, take } from 'rxjs/operators';

import {
  FeedService,
  FeedEntryService,
  UserCategoryService,
} from '@app/services/data';
import { HttpErrorService } from '@app/services';
import { Feed, FeedEntry, UserCategory } from '@app/models';
import {
  UserCategoriesModalComponent,
  ReturnData,
} from '@app/routes/main/components/feed/usercategoriesmodal/usercategoriesmodal.component';
import { IApply } from '@app/services/data/usercategory.service';
import { Sort } from '@app/services/data/sort.interface';

interface FeedImpl extends Feed {
  uuid: string;
  title: string;
  feedUrl: string;
  customTitle: string | null;
  subscribed: boolean;
  userCategoryUuids: string[];
}

interface FeedEntryImpl extends FeedEntry {
  uuid: string;
  url: string;
  title: string;
  content: string;
  isRead: boolean;
  isFavorite: boolean;
}

interface UserCategoryImpl extends UserCategory {
  text: string;
}

@Component({
  templateUrl: 'feed.component.html',
  styleUrls: ['feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {
  feed: FeedImpl | null = null;
  feedEntries: FeedEntryImpl[] = [];
  userCategories: UserCategoryImpl[] = [];

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private zone: NgZone,
    private modal: NgbModal,
    private feedService: FeedService,
    private feedEntryService: FeedEntryService,
    private userCategoryService: UserCategoryService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: paramMap => {
        const url = paramMap.get('url');
        const count = parseInt(paramMap.get('count') || '5', 10);

        if (url) {
          this.getFeed(url, count);
        }
      },
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getFeed(url: string, count: number) {
    this.feedService
      .get(url, {
        fields: [
          'uuid',
          'title',
          'customTitle',
          'subscribed',
          'userCategoryUuids',
        ],
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        map(feed => feed as FeedImpl),
      )
      .subscribe({
        next: feed => {
          feed.feedUrl = url;

          const feedEntryObservable = this.feedEntryService.query({
            fields: ['uuid', 'url', 'title', 'content', 'isRead', 'isFavorite'],
            returnTotalCount: false,
            count: count,
            search: `feedUuid:"${feed.uuid}"`,
            sort: new Sort([
              ['createdAt', 'DESC'],
              ['publishedAt', 'DESC'],
              ['updatedAt', 'DESC'],
            ]),
          });

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
                      UserCategoryImpl[]
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
