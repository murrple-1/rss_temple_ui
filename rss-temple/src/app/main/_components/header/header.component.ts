import {
  Component,
  OnInit,
  NgZone,
  Output,
  EventEmitter,
  OnDestroy,
  Renderer2,
  ElementRef,
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
import { HttpErrorService } from '@app/_services';
import { deleteSessionToken } from '@app/_modules/session.module';

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
  filteredSubscribedFeeds = new Subject<Feed[]>();

  @Output()
  feedAdded = new EventEmitter<Feed>();
  @Output()
  opmlUploaded = new EventEmitter<void>();

  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private modalService: NgbModal,
    private feedService: FeedService,
    private httpErrorService: HttpErrorService,
  ) {
    const elem = this.elementRef.nativeElement;
    for (const _class of this._classes) {
      this.renderer.addClass(elem, _class);
    }
  }

  ngOnInit() {
    this.feedService
      .all({
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
              this.filteredSubscribedFeeds.next(this.subscribedFeeds);
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
                        this.feedAdded.emit(feed);

                        this.subscribedFeeds = this.subscribedFeeds.concat(
                          feed,
                        );
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
        this.opmlUploaded.emit();

        this.feedService
          .all({
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
    const value = (event.target as HTMLInputElement).value.toLowerCase();

    const filteredFeeds = this.subscribedFeeds.filter(feed => {
      if (feed.title !== undefined) {
        return feed.title.toLowerCase().includes(value);
      } else {
        return true;
      }
    });

    this.filteredSubscribedFeeds.next(filteredFeeds);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    console.log(value);
  }

  logOut(event: Event) {
    event.stopPropagation();

    deleteSessionToken();

    // TODO delete token on the server on the way out

    this.router.navigate(['/login']);
  }
}
