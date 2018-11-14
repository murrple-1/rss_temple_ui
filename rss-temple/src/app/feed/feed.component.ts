import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { first } from 'rxjs/operators';

import { FeedService } from '@app/_services/data/feed.service';
import { Feed } from '@app/_models/feed';
import { FeedEntryService } from '@app/_services/data/feedentry.service';
import { FeedEntry } from '@app/_models/feedentry';
import { HttpErrorService } from '@app/_services/httperror.service';
import { OptionsModalComponent, Options } from '@app/feed/optionsmodal/optionsmodal.component';
import { UserCategoryService } from '@app/_services/data/usercategory.service';

@Component({
    templateUrl: 'feed.component.html',
    styleUrls: ['feed.component.scss'],
})
export class FeedComponent implements OnInit {
    feed: Feed;
    feedEntries: FeedEntry[];

    constructor(
        private feedService: FeedService,
        private feedEntryService: FeedEntryService,
        private userCategoryService: UserCategoryService,
        private httpErrorService: HttpErrorService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private zone: NgZone,
    ) { }

    ngOnInit() {
        const url = this.route.snapshot.paramMap.get('url');
        const count = parseInt(this.route.snapshot.paramMap.get('count') || '5', 10);

        this.feedService.get(url, {
            fields: ['uuid', 'title', 'subscribed'],
        }).pipe(
            first()
        ).subscribe(feed => {
            feed.feedUrl = url;
            this.zone.run(() => {
                this.feed = feed;
            });

            this.feedEntryService.some({
                fields: ['uuid', 'url', 'title', 'content', 'isRead', 'isFavorite'],
                returnTotalCount: false,
                count: count,
                search: `feedUuid:"${feed.uuid}"`,
                sort: 'createdAt:DESC,publishedAt:DESC,updatedAt:DESC',
            }).pipe(
                first()
            ).subscribe(feedEntries => {
                this.zone.run(() => {
                    this.feedEntries = feedEntries.objects;
                });
            }, error => {
                this.httpErrorService.handleError(error);
            });
        }, error => {
            this.httpErrorService.handleError(error);
        });
    }

    startSubscribe() {
        const modalRef =  this.modalService.open(OptionsModalComponent);

        modalRef.result.then((result: Options) => {
            if (result.isNewCategory) {
                const userCategoryJson = {
                    text: result.categoryText,
                };
                this.userCategoryService.create(userCategoryJson).pipe(
                    first()
                ).subscribe(_userCategory => {
                    this.feedService.subscribe(this.feed.feedUrl, _userCategory.text).pipe(
                        first()
                    ).subscribe(() => {
                        this.zone.run(() => {
                            this.feed.subscribed = true;
                        });
                    }, error => {
                        this.httpErrorService.handleError(error);
                    });
                });
            } else {
                this.feedService.subscribe(this.feed.feedUrl).pipe(
                    first()
                ).subscribe(() => {
                    this.zone.run(() => {
                        this.feed.subscribed = true;
                    });
                }, error => {
                    this.httpErrorService.handleError(error);
                });
            }
        }, error => {
            console.log(error);
        });
    }

    unsubscribe() {
        this.feedService.unsubscribe(this.feed.feedUrl).pipe(
            first()
        ).subscribe(() => {
            this.zone.run(() => {
                this.feed.subscribed = false;
            });
        }, error => {
            this.httpErrorService.handleError(error);
        });
    }
}
