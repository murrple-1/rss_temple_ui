import { Component, NgZone } from '@angular/core';

import { first } from 'rxjs/operators';

import { FeedService } from '@app/_services/data/feed.service';
import { FeedEntry } from '@app/_models/feedentry';
import { FeedEntryService } from '@app/_services/data/feedentry.service';

@Component({
    templateUrl: 'main.component.html',
    styleUrls: ['main.component.scss'],
})
export class MainComponent {
    feedUrl: string;
    feedEntries: FeedEntry[];

    constructor(
        private feedService: FeedService,
        private feedEntryService: FeedEntryService,
        private zone: NgZone,
    ) { }

    onSubscribe() {
        this.feedService.get(this.feedUrl, {
            fields: ['uuid'],
        }).pipe(
            first()
        ).subscribe(feed => {
            this.feedEntryService.some({
                fields: ['title', 'url', 'content'],
                search: 'feedUuid:"' + feed.uuid + '"',
            }).pipe(
                first()
            ).subscribe(feedEntriesObj => {
                this.zone.run(() => {
                    this.feedEntries = feedEntriesObj.objects;
                });
            }, error => {
                console.log(error);
            });
        }, error => {
            console.log(error);
        });
    }
}
