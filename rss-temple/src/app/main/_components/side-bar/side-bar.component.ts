import { Component, OnInit, NgZone, Output, EventEmitter, OnDestroy, HostBinding, ElementRef, Renderer2 } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Feed } from '@app/_models/feed';
import { FeedService } from '@app/_services/data/feed.service';
import { SubscribeModalComponent, SubscriptionDetails } from './subscribemodal/subscribemodal.component';
import { OPMLModalComponent } from './opmlmodal/opmlmodal.component';
import { HttpErrorService } from '@app/_services/httperror.service';


@Component({
  selector: 'nav[rsst-side-bar]',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit, OnDestroy {
  subscribedFeeds: Feed[];

  private readonly _classes: string[] = [
    'col-md-2',
    'd-none',
    'd-md-block',
    'bg-light',
    'sidebar',
  ];

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
    this.feedService.all({
      fields: ['title', 'feedUrl'],
      search: 'subscribed:"true"',
      returnTotalCount: false,
    }).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(feeds => {
      this.zone.run(() => {
        this.subscribedFeeds = feeds.objects;
      });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addFeed() {
    const modalRef = this.modalService.open(SubscribeModalComponent);

    modalRef.result.then((result: SubscriptionDetails) => {
      this.feedService.get(result.feedUrl, {
        fields: ['uuid', 'title', 'subscribed'],
      }).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(feed => {
        feed.feedUrl = result.feedUrl;
        if (!feed.subscribed) {
          this.feedService.subscribe(result.feedUrl).pipe(
            takeUntil(this.unsubscribe$)
          ).subscribe(() => {
            this.zone.run(() => {
              this.feedAdded.emit(feed);

              this.subscribedFeeds = this.subscribedFeeds.concat(feed);
            });
          }, error => {
            this.httpErrorService.handleError(error);
          });
        } else {
          // TODO something?
        }
      }, error => {
        this.httpErrorService.handleError(error);
      });
    }, () => {
      // dialog dismissed, no-op
    });
  }

  uploadOPML() {
    const modalRef = this.modalService.open(OPMLModalComponent);

    modalRef.result.then(() => {
      this.opmlUploaded.emit();

      this.feedService.all({
        fields: ['title', 'feedUrl'],
        search: 'subscribed:"true"',
        returnTotalCount: false,
      }).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(feeds => {
        this.zone.run(() => {
          this.subscribedFeeds = feeds.objects;
        });
      });
    }, () => {
      // dialog dismissed, no-op
    });
  }
}