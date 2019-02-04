import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeedService } from '@app/_services/data/feed.service';
import { Feed } from '@app/_models/feed';
import { FeedEntry } from '@app/_models/feedentry';
import { FeedEntryService } from '@app/_services/data/feedentry.service';
import { HttpErrorService } from '@app/_services/httperror.service';

@Component({
    templateUrl: 'feeds.component.html',
    styleUrls: ['feeds.component.scss'],
})
export class FeedsComponent implements OnInit, OnDestroy {
    feedEntries: FeedEntry[];

    private feeds: Feed[];

    private count = 5;

    private unsubscribe$ = new Subject<void>();

    constructor(
        private feedService: FeedService,
        private feedEntryService: FeedEntryService,
        private httpErrorService: HttpErrorService,
        private zone: NgZone,
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        this.route.paramMap.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(paramMap => {
            this.count = parseInt(paramMap.get('count') || this.count.toString(), 10);

            this.getFeedEntries();
        });

        this.getFeeds();
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private getFeeds() {
        this.feedService.all({
            fields: ['uuid'],
            search: 'subscribed:"true"',
            returnTotalCount: false,
        }).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(feeds => {
            this.zone.run(() => {
                this.feeds = feeds.objects;
            });

            this.getFeedEntries();
        }, (error: HttpErrorResponse) => {
            this.httpErrorService.handleError(error);
        });
    }

    private getFeedEntries() {
        if (this.feeds && this.feeds.length > 0) {
            this.feedEntryService.some({
                fields: ['uuid', 'url', 'title', 'content', 'isRead'],
                returnTotalCount: false,
                count: this.count,
                search: `feedUuid:"${this.feeds.map(feed => feed.uuid).join('|')}" and isRead:"false"`,
                sort: 'createdAt:DESC,publishedAt:DESC,updatedAt:DESC',
            }).pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(feedEntries => {
                this.zone.run(() => {
                    this.feedEntries = feedEntries.objects;
                });
            }, (error: HttpErrorResponse) => {
                this.httpErrorService.handleError(error);
            });
        }
    }

    feedAdded(feed: Feed) {
        this.feeds = this.feeds.concat(feed);

        this.getFeedEntries();
    }

    opmlUploaded() {
        this.getFeeds();
    }
}
