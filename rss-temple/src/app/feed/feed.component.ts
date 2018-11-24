import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { first } from 'rxjs/operators';

import { FeedService } from '@app/_services/data/feed.service';
import { Feed } from '@app/_models/feed';
import { FeedEntryService } from '@app/_services/data/feedentry.service';
import { FeedEntry } from '@app/_models/feedentry';
import { HttpErrorService } from '@app/_services/httperror.service';

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
        private httpErrorService: HttpErrorService,
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
