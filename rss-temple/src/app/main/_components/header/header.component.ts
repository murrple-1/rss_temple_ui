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

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  SubscribeModalComponent,
  SubscriptionDetails,
} from '@app/main/_components/header/subscribemodal/subscribemodal.component';
import { OPMLModalComponent } from '@app/main/_components/header/opmlmodal/opmlmodal.component';
import { Feed } from '@app/_models';
import { FeedService } from '@app/_services/data';
import { HttpErrorService, LoginService } from '@app/_services';
import { FeedObservableService } from '@app/main/_services';
import { deleteSessionToken, sessionToken } from '@app/_modules/session.module';

@Component({
  selector: 'nav[rsst-header]',
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

  private subscribedFeeds: Feed[] = [];
  filteredSubscribedFeeds: Feed[] = [];

  @ViewChild('filterInput')
  private filterInput: ElementRef<HTMLInputElement> | null = null;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private modalService: NgbModal,
    private feedService: FeedService,
    private feedObservableService: FeedObservableService,
    private loginService: LoginService,
    private httpErrorService: HttpErrorService,
  ) {
    const elem = this.elementRef.nativeElement;
    for (const _class of this._classes) {
      this.renderer.addClass(elem, _class);
    }
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
    this.feedService
      .queryAll({
        fields: ['title', 'feedUrl'],
        search: 'subscribed:"true"',
        sort: 'title:ASC',
        returnTotalCount: false,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feeds => {
          this.zone.run(() => {
            if (feeds.objects !== undefined) {
              this.subscribedFeeds = feeds.objects;
              this.filteredSubscribedFeeds = feeds.objects;
            }
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

                        this.subscribedFeeds = this.subscribedFeeds
                          .concat(feed)
                          .sort(HeaderComponent.sortFeeds);

                        if (this.filterInput !== null) {
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

        this.feedService
          .queryAll({
            fields: ['title', 'feedUrl'],
            search: 'subscribed:"true"',
            returnTotalCount: false,
          })
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: feeds => {
              this.zone.run(() => {
                if (feeds.objects !== undefined) {
                  this.subscribedFeeds = feeds.objects;

                  if (this.filterInput !== null) {
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
    value = value.toLowerCase();

    const filteredFeeds = this.subscribedFeeds.filter(feed => {
      if (feed.title !== undefined) {
        return feed.title.toLowerCase().includes(value);
      } else {
        return false;
      }
    });

    this.filteredSubscribedFeeds = filteredFeeds;
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
