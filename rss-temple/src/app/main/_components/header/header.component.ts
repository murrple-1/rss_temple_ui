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
import { HttpErrorResponse } from '@angular/common/http';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  SubscribeModalComponent,
  SubscriptionDetails,
} from '@app/main/_components/header/subscribemodal/subscribemodal.component';
import { OPMLModalComponent } from '@app/main/_components/header/opmlmodal/opmlmodal.component';
import { Feed } from '@app/_models/feed';
import { FeedService } from '@app/_services/data/feed.service';
import { HttpErrorService } from '@app/_services/httperror.service';

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
  ];

  isCollapsed = true;

  private subscribedFeeds: Feed[];
  filteredSubscribedFeeds = new Subject<Feed[]>();

  @Output()
  feedAdded = new EventEmitter<Feed>();
  @Output()
  opmlUploaded = new EventEmitter<void>();

  private unsubscribe$ = new Subject<void>();

  constructor(
    private feedService: FeedService,
    private httpErrorService: HttpErrorService,
    private modalService: NgbModal,
    private zone: NgZone,
    private elementRef: ElementRef,
    private renderer: Renderer2,
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
      .subscribe(
        feeds => {
          this.zone.run(() => {
            this.subscribedFeeds = feeds.objects;
            this.filteredSubscribedFeeds.next(this.subscribedFeeds);
          });
        },
        (error: HttpErrorResponse) => {
          this.httpErrorService.handleError(error);
        },
      );
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
          .subscribe(
            feed => {
              feed.feedUrl = result.feedUrl;
              if (!feed.subscribed) {
                this.feedService
                  .subscribe(result.feedUrl)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(
                    () => {
                      this.zone.run(() => {
                        this.feedAdded.emit(feed);

                        this.subscribedFeeds = this.subscribedFeeds.concat(
                          feed,
                        );
                      });
                    },
                    (error: HttpErrorResponse) => {
                      this.httpErrorService.handleError(error);
                    },
                  );
              } else {
                // TODO something?
              }
            },
            (error: HttpErrorResponse) => {
              this.httpErrorService.handleError(error);
            },
          );
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
          .subscribe(feeds => {
            this.zone.run(() => {
              this.subscribedFeeds = feeds.objects;
            });
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
      return feed.title.toLowerCase().includes(value);
    });

    this.filteredSubscribedFeeds.next(filteredFeeds);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    console.log(value);
  }
}
