import { Component, Input, NgZone } from '@angular/core';

import { first } from 'rxjs/operators';

import { FeedEntry } from '@app/_models/feedentry';
import { FeedEntryService } from '@app/_services/data/feedentry.service';

@Component({
  selector: 'rsst-feed-entry-view',
  templateUrl: './feed-entry-view.component.html',
  styleUrls: ['./feed-entry-view.component.scss']
})
export class FeedEntryViewComponent {
    @Input()
    feedEntry: FeedEntry;

    constructor(
        private feedEntryService: FeedEntryService,
        private zone: NgZone,
    ) { }

    read() {
        this.feedEntryService.read(this.feedEntry).pipe(
            first()
        ).subscribe(() => {
            this.zone.run(() => {
            this.feedEntry.isRead = true;
            });
        }, error => {
            console.log(error);
        });
    }

    unread() {
        this.feedEntryService.unread(this.feedEntry).pipe(
            first()
        ).subscribe(() => {
            this.zone.run(() => {
            this.feedEntry.isRead = false;
            });
        }, error => {
            console.log(error);
        });
    }

    favorite() {
        this.feedEntryService.favorite(this.feedEntry).pipe(
            first()
        ).subscribe(() => {
            this.zone.run(() => {
            this.feedEntry.isFavorite = true;
            });
        }, error => {
            console.log(error);
        });
    }

    unfavorite() {
        this.feedEntryService.unfavorite(this.feedEntry).pipe(
            first()
        ).subscribe(() => {
            this.zone.run(() => {
            this.feedEntry.isFavorite = false;
            });
        }, error => {
            console.log(error);
        });
    }
}
