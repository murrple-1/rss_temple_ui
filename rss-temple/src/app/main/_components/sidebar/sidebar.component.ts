import { Component, OnInit, NgZone, Output, EventEmitter, OnDestroy, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Feed } from '@app/_models/feed';
import { FeedService } from '@app/_services/data/feed.service';
import { SubscribeModalComponent, SubscriptionDetails } from '@app/main/_components/sidebar/subscribemodal/subscribemodal.component';
import { OPMLModalComponent } from '@app/main/_components/sidebar/opmlmodal/opmlmodal.component';
import { HttpErrorService } from '@app/_services/httperror.service';

@Component({
  selector: 'nav[rsst-sidebar]',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  private userRequestedCollapsed = false;
  shownMenu: string = null;
  private readonly collapsedClass = 'collapsed';

  private readonly _classes: string[] = [
    'sidebar',
  ];

  subscribedFeeds: Feed[];

  @Output()
  collapsedEvent = new EventEmitter<boolean>();

  @Output()
  feedAdded = new EventEmitter<Feed>();
  @Output()
  opmlUploaded = new EventEmitter<void>();

  @ViewChild('searchBar')
  private searchBar: ElementRef;

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
    }, (error: HttpErrorResponse) => {
      this.httpErrorService.handleError(error);
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setExpandedMenu(menuName: string) {
    if (menuName === this.shownMenu) {
      this.shownMenu = null;
      this.setIsCollapsed(this.userRequestedCollapsed);
    } else {
      this.shownMenu = menuName;
      this.setIsCollapsed(false);
    }
  }

  onToggleCollapseClicked() {
    this.userRequestedCollapsed = !this.userRequestedCollapsed;
    this.setIsCollapsed(this.userRequestedCollapsed);
  }

  onSearchIconClicked() {
    this.userRequestedCollapsed = false;
    this.setIsCollapsed(false);

    (this.searchBar.nativeElement as HTMLInputElement).focus();
  }

  private setIsCollapsed(isCollapsed: boolean) {
    if (this.isCollapsed !== isCollapsed) {
      this.isCollapsed = isCollapsed;

      const elem = this.elementRef.nativeElement;
      if (isCollapsed) {
        this.renderer.addClass(elem, this.collapsedClass);
      } else {
        this.renderer.removeClass(elem, this.collapsedClass);
      }

      this.collapsedEvent.emit(isCollapsed);
    }
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
          }, (error: HttpErrorResponse) => {
            this.httpErrorService.handleError(error);
          });
        } else {
          // TODO something?
        }
      }, (error: HttpErrorResponse) => {
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
