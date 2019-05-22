import {
  Component,
  OnInit,
  NgZone,
  OnDestroy,
  Renderer2,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject, zip } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import {
  SubscribeModalComponent,
  SubscriptionDetails,
} from '@app/routes/main/components/shared/header/subscribemodal/subscribemodal.component';
import { OPMLModalComponent } from '@app/routes/main/components/shared/header/opmlmodal/opmlmodal.component';
import { FeedService, UserCategoryService } from '@app/services/data';
import { HttpErrorService, LoginService } from '@app/services';
import { FeedObservableService } from '@app/routes/main/services';
import { deleteSessionToken, sessionToken } from '@app/libs/session.lib';
import { UserCategory, Feed } from '@app/models';
import { Sort } from '@app/services/data/sort.interface';

interface UserCategoryImpl extends UserCategory {
  text: string;
  feedUuids: string[];
}

interface FeedImpl extends Feed {
  uuid: string;
  calculatedTitle: string;
  feedUrl: string;
}

interface FeedImpl2 extends Feed {
  uuid: string;
  title: string;
  subscribed: boolean;
}

interface CategorizedFeeds {
  noCategory: FeedImpl[];
  category: {
    name: string;
    feeds: FeedImpl[];
  }[];
}

@Component({
  selector: 'nav[app-header]',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly _classes: string[] = [
    'navbar',
    'navbar-expand-lg',
    'navbar-dark',
    'bg-dark',
    'fixed-top',
  ];

  isCollapsed = true;

  private allCategorizedFeeds: CategorizedFeeds = {
    noCategory: [],
    category: [],
  };
  filteredCategorizedFeeds: CategorizedFeeds = {
    noCategory: [],
    category: [],
  };

  @ViewChild('filterInput')
  private filterInput?: ElementRef<HTMLInputElement>;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private modal: NgbModal,
    private feedService: FeedService,
    private userCategoryService: UserCategoryService,
    private feedObservableService: FeedObservableService,
    private loginService: LoginService,
    private httpErrorService: HttpErrorService,
  ) {
    const elem = this.elementRef.nativeElement;
    for (const _class of this._classes) {
      this.renderer.addClass(elem, _class);
    }
  }

  private static buildAllCategorizedFeeds(
    userCategories: UserCategoryImpl[],
    feeds: FeedImpl[],
  ) {
    const allCategorizedFeedUuids = new Set<string>(
      userCategories.flatMap(userCategory_ => {
        if (userCategory_.feedUuids !== undefined) {
          return userCategory_.feedUuids;
        } else {
          return [];
        }
      }),
    );

    const allCategorizedFeeds: CategorizedFeeds = {
      noCategory: feeds.filter(feed_ => {
        if (feed_.uuid !== undefined) {
          return !allCategorizedFeedUuids.has(feed_.uuid);
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
          feeds: feeds.filter(feed_ => {
            if (feed_.uuid !== undefined) {
              return feedUuids.has(feed_.uuid);
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
    zip(
      this.userCategoryService.queryAll({
        fields: ['text', 'feedUuids'],
        sort: new Sort([['text', 'ASC']]),
        returnTotalCount: false,
      }),
      this.feedService.queryAll({
        fields: ['uuid', 'calculatedTitle', 'feedUrl'],
        search: 'subscribed:"true"',
        sort: new Sort([['calculatedTitle', 'ASC']]),
        returnTotalCount: false,
      }),
    )
      .pipe(
        takeUntil(this.unsubscribe$),
        map(([userCategories, feeds]) => {
          if (
            userCategories.objects !== undefined &&
            feeds.objects !== undefined
          ) {
            return [userCategories.objects, feeds.objects] as [
              UserCategoryImpl[],
              FeedImpl[]
            ];
          }
          throw new Error('malformed response');
        }),
      )
      .subscribe({
        next: ([userCategories, feeds]) => {
          const allCategorizedFeeds = HeaderComponent.buildAllCategorizedFeeds(
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

  addFeed() {
    const modalRef = this.modal.open(SubscribeModalComponent);

    modalRef.result.then(
      (result: SubscriptionDetails) => {
        this.feedService
          .get(result.feedUrl, {
            fields: ['uuid', 'title', 'subscribed'],
          })
          .pipe(
            takeUntil(this.unsubscribe$),
            map(feed => feed as FeedImpl2),
          )
          .subscribe({
            next: feed_ => {
              const feed: FeedImpl = {
                uuid: feed_.uuid,
                feedUrl: result.feedUrl,
                calculatedTitle: feed_.title,
              };
              if (!feed_.subscribed) {
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
                          .sort(HeaderComponent.sortFeeds);

                        if (this.filterInput !== undefined) {
                          this.filterFeeds(
                            this.filterInput.nativeElement.value,
                          );
                        }
                      });
                    },
                    error: error => {
                      this.httpErrorService.handleError(error);
                    },
                  });
              } else {
                // TODO something?
              }
            },
            error: error => {
              this.httpErrorService.handleError(error);
            },
          });
      },
      () => {
        // dialog dismissed, no-op
      },
    );
  }

  uploadOPML() {
    const modalRef = this.modal.open(OPMLModalComponent);

    modalRef.result.then(
      () => {
        this.feedObservableService.feedsChanged.next();

        zip(
          this.userCategoryService.queryAll({
            fields: ['text', 'feedUuids'],
            sort: new Sort([['text', 'ASC']]),
            returnTotalCount: false,
          }),
          this.feedService.queryAll({
            fields: ['uuid', 'calculatedTitle', 'feedUrl'],
            search: 'subscribed:"true"',
            sort: new Sort([['calculatedTitle', 'ASC']]),
            returnTotalCount: false,
          }),
        )
          .pipe(
            takeUntil(this.unsubscribe$),
            map(([userCategories, feeds]) => {
              if (
                userCategories.objects !== undefined &&
                feeds.objects !== undefined
              ) {
                return [userCategories.objects, feeds.objects] as [
                  UserCategoryImpl[],
                  FeedImpl[]
                ];
              }
              throw new Error('malformed response');
            }),
          )
          .subscribe({
            next: ([userCategories, feeds]) => {
              this.zone.run(() => {
                this.allCategorizedFeeds = HeaderComponent.buildAllCategorizedFeeds(
                  userCategories,
                  feeds,
                );

                if (this.filterInput !== undefined) {
                  this.filterFeeds(this.filterInput.nativeElement.value);
                }
              });
            },
          });
      },
      () => {
        // dialog dismissed, no-op
      },
    );
  }

  onFilterInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.filterFeeds(value);
  }

  private filterFeeds(value: string) {
    value = value.trim().toLowerCase();

    const filterFn = (feed: FeedImpl) => {
      if (feed.calculatedTitle !== undefined) {
        return feed.calculatedTitle.toLowerCase().includes(value);
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

  onSearch(event: Event) {
    // TODO searching?

    const value = (event.target as HTMLInputElement).value;

    console.log(value);
  }

  logOut(event: Event) {
    event.stopPropagation();

    const _sessionToken = sessionToken();
    if (_sessionToken !== null) {
      deleteSessionToken();

      this.loginService
        .deleteSessionToken({
          sessionToken: _sessionToken,
        })
        .subscribe({
          next: () => {
            // do nothing
          },
          error: error => {
            console.log(error);
          },
        });
    }

    this.router.navigate(['/login']);
  }
}
