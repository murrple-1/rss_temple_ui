import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FeedService } from '@app/_services/data/feed.service';
import { Feed } from '@app/_models/feed';
import { FeedEntryService } from '@app/_services/data/feedentry.service';
import { FeedEntry } from '@app/_models/feedentry';
import { HttpErrorService } from '@app/_services/httperror.service';

@Component({
    templateUrl: 'feed.component.html',
    styleUrls: ['feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {
    feed: Feed;
    feedEntries: FeedEntry[];

    private unsubscribe$ = new Subject<void>();

    constructor(
        private feedService: FeedService,
        private feedEntryService: FeedEntryService,
        private httpErrorService: HttpErrorService,
        private route: ActivatedRoute,
        private zone: NgZone,
    ) { }

    ngOnInit() {
        this.route.paramMap.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(paramMap => {
            const url = paramMap.get('url');
            const count = parseInt(paramMap.get('count') || '5', 10);

            this.initialize(url, count);
        });
    }

    private initialize(url: string, count: number) {
        this.feedService.get(url, {
            fields: ['uuid', 'title', 'subscribed'],
        }).pipe(
            takeUntil(this.unsubscribe$)
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
                takeUntil(this.unsubscribe$)
            ).subscribe(feedEntries => {
                this.zone.run(() => {
                    this.feedEntries = feedEntries.objects;
                });
            }, (error: HttpErrorResponse) => {
                this.httpErrorService.handleError(error);
            });
        }, (error: HttpErrorResponse) => {
            this.httpErrorService.handleError(error);
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    startSubscribe() {
        this.feedService.subscribe(this.feed.feedUrl).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
            this.zone.run(() => {
                this.feed.subscribed = true;
            });
        }, (error: HttpErrorResponse) => {
            this.httpErrorService.handleError(error);
        });
    }

    unsubscribe() {
        this.feedService.unsubscribe(this.feed.feedUrl).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
            this.zone.run(() => {
                this.feed.subscribed = false;
            });
        }, (error: HttpErrorResponse) => {
            this.httpErrorService.handleError(error);
        });
    }
}
