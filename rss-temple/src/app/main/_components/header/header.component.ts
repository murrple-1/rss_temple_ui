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
import { takeUntil } from 'rxjs/operators';

import {
  SubscribeModalComponent,
  SubscriptionDetails,
} from '@app/main/_components/header/subscribemodal/subscribemodal.component';
import { OPMLModalComponent } from '@app/main/_components/header/opmlmodal/opmlmodal.component';
import { Feed, UserCategory } from '@app/_models';
import { FeedService, UserCategoryService } from '@app/_services/data';
import { HttpErrorService, LoginService } from '@app/_services';
import { FeedObservableService } from '@app/main/_services';
import { deleteSessionToken, sessionToken } from '@app/_modules/session.module';

interface CategorizedFeeds {
  noCategory: Feed[];
  category: {
    name: string;
    feeds: Feed[];
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

  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private modalService: NgbModal,
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
    userCategories: UserCategory[],
    feeds: Feed[],
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

  private static sortFeeds(a: Feed, b: Feed) {
    if (a.title !== undefined) {
      if (b.title !== undefined) {
        return a.title.localeCompare(b.title);
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
        sort: 'text:ASC',
        returnTotalCount: false,
      }),
      this.feedService.queryAll({
        fields: ['uuid', 'title', 'feedUrl'],
        search: 'subscribed:"true"',
        sort: 'title:ASC',
        returnTotalCount: false,
      }),
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([userCategories, feeds]) => {
          if (
            userCategories.objects !== undefined &&
            feeds.objects !== undefined
          ) {
            const allCategorizedFeeds = HeaderComponent.buildAllCategorizedFeeds(
              userCategories.objects,
              feeds.objects,
            );
            this.zone.run(() => {
              this.allCategorizedFeeds = allCategorizedFeeds;
              this.filteredCategorizedFeeds = allCategorizedFeeds;
            });
          }
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
    const modalRef = this.modalService.open(SubscribeModalComponent);

    modalRef.result.then(
      (result: SubscriptionDetails) => {
        this.feedService
          .get(result.feedUrl, {
            fields: ['uuid', 'title', 'subscribed'],
          })
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: feed => {
              feed.feedUrl = result.feedUrl;
              if (!feed.subscribed) {
                this.feedService
                  .subscribe(result.feedUrl)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe({
                    next: () => {
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
    const modalRef = this.modalService.open(OPMLModalComponent);

    modalRef.result.then(
      () => {
        this.feedObservableService.feedsChanged.next();

        zip(
          this.userCategoryService.queryAll({
            fields: ['text', 'feedUuids'],
            sort: 'text:ASC',
            returnTotalCount: false,
          }),
          this.feedService.queryAll({
            fields: ['uuid', 'title', 'feedUrl'],
            search: 'subscribed:"true"',
            sort: 'title:ASC',
            returnTotalCount: false,
          }),
        )
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: ([userCategories, feeds]) => {
              this.zone.run(() => {
                if (
                  userCategories.objects !== undefined &&
                  feeds.objects !== undefined
                ) {
                  this.allCategorizedFeeds = HeaderComponent.buildAllCategorizedFeeds(
                    userCategories.objects,
                    feeds.objects,
                  );

                  if (this.filterInput !== undefined) {
                    this.filterFeeds(this.filterInput.nativeElement.value);
                  }
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

    const filterFn = (feed: Feed) => {
      if (feed.title !== undefined) {
        return feed.title.toLowerCase().includes(value);
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
