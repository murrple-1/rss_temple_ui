import { Component, OnInit, NgZone, Output, EventEmitter, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
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
  collapsed = false;
  shownMenu: string = null;
  private readonly pushRightClass = 'push-right';
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

  private unsubscribe$ = new Subject<void>();

  constructor(
    private feedService: FeedService,
    private httpErrorService: HttpErrorService,
    private modalService: NgbModal,
    private zone: NgZone,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {
    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
        this.toggleSidebar();
      }
    });

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
    } else {
      this.shownMenu = menuName;
    }
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;

    const elem = this.elementRef.nativeElement;
    if (this.collapsed) {
      this.renderer.addClass(elem, this.collapsedClass);
    } else {
      this.renderer.removeClass(elem, this.collapsedClass);
    }

    this.collapsedEvent.emit(this.collapsed);
  }

  isToggled() {
    return document.querySelector('body').classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    document.querySelector('body').classList.toggle(this.pushRightClass);
  }

  onLoggedout() {
    localStorage.removeItem('isLoggedin');
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
