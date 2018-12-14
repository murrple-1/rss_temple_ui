import { Component, OnInit, NgZone, Output, EventEmitter } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Feed } from '@app/_models/feed';
import { FeedService } from '@app/_services/data/feed.service';
import { SubscribeModalComponent, SubscriptionDetails } from '@app/_components/side-bar/subscribemodal/subscribemodal.component';
import { OPMLModalComponent } from '@app/_components/side-bar/opmlmodal/opmlmodal.component';
import { HttpErrorService } from '@app/_services/httperror.service';

@Component({
  selector: 'rsst-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  subscribedFeeds: Feed[];

  @Output()
  feedAdded = new EventEmitter<Feed>();
  @Output()
  opmlUploaded = new EventEmitter<void>();

  constructor(
    private feedService: FeedService,
    private httpErrorService: HttpErrorService,
    private modalService: NgbModal,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.feedService.all({
      fields: ['title', 'feedUrl'],
      search: 'subscribed:"true"',
      returnTotalCount: false,
    }).subscribe(feeds => {
      this.zone.run(() => {
        this.subscribedFeeds = feeds.objects;
      });
    });
  }

  addFeed() {
    const modalRef = this.modalService.open(SubscribeModalComponent);

    modalRef.result.then((result: SubscriptionDetails) => {
      this.feedService.get(result.feedUrl, {
        fields: ['uuid', 'title', 'subscribed'],
      }).subscribe(feed => {
        feed.feedUrl = result.feedUrl;
        if (!feed.subscribed) {
          this.feedService.subscribe(result.feedUrl).subscribe(() => {
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
      }).subscribe(feeds => {
        this.zone.run(() => {
          this.subscribedFeeds = feeds.objects;
        });
      });
    }, () => {
      // dialog dismissed, no-op
    });
  }
}
