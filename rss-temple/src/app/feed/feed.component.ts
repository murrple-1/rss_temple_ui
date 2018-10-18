import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { first } from 'rxjs/operators';

import { FeedService } from '@app/_services/data/feed.service';
import { Feed } from '@app/_models/feed';

@Component({
    templateUrl: 'feed.component.html',
    styleUrls: ['feed.component.scss'],
})
export class FeedComponent implements OnInit {
    feed: Feed;

    constructor(
        private feedService: FeedService,
        private route: ActivatedRoute,
        private zone: NgZone,
    ) { }

    ngOnInit() {
        const url = this.route.snapshot.paramMap.get('url');
        this.feedService.get(url, {
            fields: ['uuid', 'title'],
        }).pipe(
            first()
        ).subscribe(feed => {
            this.zone.run(() => {
                this.feed = feed;
            });
        });
    }
}
