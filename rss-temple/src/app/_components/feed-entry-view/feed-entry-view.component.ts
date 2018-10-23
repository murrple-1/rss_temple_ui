import { Component, OnInit, Input, NgZone } from '@angular/core';

import { first } from 'rxjs/operators';

import { FeedEntry } from '@app/_models/feedentry';
import { FeedEntryService } from '@app/_services/data/feedentry.service';

@Component({
  selector: 'rsst-feed-entry-view',
  templateUrl: './feed-entry-view.component.html',
  styleUrls: ['./feed-entry-view.component.scss']
})
export class FeedEntryViewComponent implements OnInit {
  @Input()
  feedEntry: FeedEntry;

  constructor(
    private feedEntryService: FeedEntryService,
    private zone: NgZone,
  ) { }

  ngOnInit() {
  }

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
}
