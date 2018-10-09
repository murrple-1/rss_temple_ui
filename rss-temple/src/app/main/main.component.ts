import { Component, NgZone } from '@angular/core';

import { first } from 'rxjs/operators';

import { FeedService } from '@app/_services/feed.service';
import { Feed } from '@app/_models/feed';
import { FeedEntryService } from '@app/_services/feedentry.service';

@Component({
    templateUrl: 'main.component.html',
    styleUrls: ['main.component.scss'],
})
export class MainComponent {
    feedUrl: string;
    feed: Feed;

    constructor(
        private feedService: FeedService,
        private feedEntryService: FeedEntryService,
        private zone: NgZone,
    ) { }

    onSubscribe() {
        this.feedService.get(this.feedUrl, ['uuid', 'title', 'feedUrl', 'homeUrl', 'publishedAt', 'updatedAt']).pipe(
            first()
        ).subscribe(feed => {
            this.zone.run(() => {
                this.feed = feed;
            });
        }, error => {
            console.log(error);
        });
    }
}
