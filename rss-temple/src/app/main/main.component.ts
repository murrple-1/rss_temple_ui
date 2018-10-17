import { Component, NgZone, OnInit } from '@angular/core';

import { first } from 'rxjs/operators';

import { FeedService } from '@app/_services/data/feed.service';
import { FeedEntry } from '@app/_models/feedentry';
import { FeedEntryService } from '@app/_services/data/feedentry.service';

interface Subscription {
    name: string;
    url: string;
}

@Component({
    templateUrl: 'main.component.html',
    styleUrls: ['main.component.scss'],
})
export class MainComponent implements OnInit {
    subscriptions: Subscription[];
    feedEntries: FeedEntry[];

    constructor(
        private feedService: FeedService,
        private feedEntryService: FeedEntryService,
        private zone: NgZone,
    ) { }

    ngOnInit() {
        this.feedService.allSubscribed({
            fields: ['uuid', 'title', 'feedUrl'],
            returnTotalCount: false,
        }).pipe(
            first()
        ).subscribe(feeds => {
            const subscriptions: Subscription[] = feeds.objects.map(feed => {
                const subscription: Subscription = {
                    name: feed.title,
                    url: feed.feedUrl,
                };
                return subscription;
            });
            this.zone.run(() => {
                this.subscriptions = subscriptions;
            });

            this.feedEntryService.some({
                fields: ['url', 'title', 'content'],
                returnTotalCount: false,
                count: 5,
                search: 'feedUuid:"' + feeds.objects.map(feed => feed.uuid).join('|') + '"',
                sort: 'createdAt:DESC,publishedAt:DESC,updatedAt:DESC',
            }).pipe(
                first()
            ).subscribe(feedEntries => {
                this.zone.run(() => {
                    this.feedEntries = feedEntries.objects;
                });
            }, error => {
                console.log(error);
            });
        }, error => {
            console.log(error);
        });
    }
}
