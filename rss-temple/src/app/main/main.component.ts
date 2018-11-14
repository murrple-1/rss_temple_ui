import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { first } from 'rxjs/operators';

import { FeedService } from '@app/_services/data/feed.service';
import { FeedEntry } from '@app/_models/feedentry';
import { FeedEntryService } from '@app/_services/data/feedentry.service';
import { HttpErrorService } from '@app/_services/httperror.service';

@Component({
    templateUrl: 'main.component.html',
    styleUrls: ['main.component.scss'],
})
export class MainComponent implements OnInit {
    feedEntries: FeedEntry[];

    constructor(
        private feedService: FeedService,
        private feedEntryService: FeedEntryService,
        private httpErrorService: HttpErrorService,
        private zone: NgZone,
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        const count = parseInt(this.route.snapshot.paramMap.get('count') || '5', 10);

        this.feedService.all({
            fields: ['uuid'],
            search: 'subscribed:"true"',
            returnTotalCount: false,
        }).pipe(
            first()
        ).subscribe(feeds => {
            if (feeds.objects.length > 0) {
                this.feedEntryService.some({
                    fields: ['uuid', 'url', 'title', 'content', 'isRead'],
                    returnTotalCount: false,
                    count: count,
                    search: `feedUuid:"${feeds.objects.map(feed => feed.uuid).join('|')}" and isRead:"false"`,
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
            }
        }, error => {
            this.httpErrorService.handleError(error);
        });
    }
}
