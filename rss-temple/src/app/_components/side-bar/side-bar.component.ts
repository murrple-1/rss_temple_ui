import { Component, OnInit, NgZone } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { Feed } from '@app/_models/feed';
import { FeedService } from '@app/_services/data/feed.service';
import { SubscribeModalComponent, SubscriptionDetails } from '@app/_components/side-bar/subscribemodal/subscribemodal.component';
import { UserCategoryService } from '@app/_services/data/usercategory.service';
import { HttpErrorService } from '@app/_services/httperror.service';
import { UserCategory } from '@app/_models/usercategory';

@Component({
  selector: 'rsst-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  subscribedFeeds: Feed[];

  constructor(
    private feedService: FeedService,
    private userCategoryService: UserCategoryService,
    private httpErrorService: HttpErrorService,
    private modalService: NgbModal,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.feedService.all({
      fields: ['title', 'feedUrl'],
      search: 'subscribed:"true"',
      returnTotalCount: false,
    }).pipe(
      first()
    ).subscribe(feeds => {
      this.zone.run(() => {
        this.subscribedFeeds = feeds.objects;
      });
    });
  }

  addFeed() {
    const modalRef = this.modalService.open(SubscribeModalComponent);

    modalRef.result.then((result: SubscriptionDetails) => {
      let userCategoryObservable: Observable<UserCategory>;
      if (result.isNewCategory) {
        const userCategoryJson = {
          text: result.categoryText,
        };
        userCategoryObservable = this.userCategoryService.create(userCategoryJson);
      } else {
        userCategoryObservable = new Observable<UserCategory>(subscriber => {
          subscriber.next(undefined);
          subscriber.complete();
        });
      }

      userCategoryObservable.pipe(
        first()
      ).subscribe(_userCategory => {
        this.feedService.get(result.feedUrl, {
          fields: ['title', 'subscribed'],
        }).pipe(
          first()
        ).subscribe(feed => {
          feed.feedUrl = result.feedUrl;
          if (!feed.subscribed) {
            this.feedService.subscribe(result.feedUrl, (_userCategory ? _userCategory.text : undefined)).pipe(
              first()
            ).subscribe(() => {
              this.zone.run(() => {
                this.subscribedFeeds = this.subscribedFeeds.concat([feed]);
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
      });
    }, error => {
      console.log(error);
    });
  }
}
