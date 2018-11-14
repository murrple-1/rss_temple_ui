import { Component, OnInit, NgZone } from '@angular/core';

import { first } from 'rxjs/operators';

import { Feed } from '@app/_models/feed';
import { FeedService } from '@app/_services/data/feed.service';

@Component({
  selector: 'rsst-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  subscribedFeeds: Feed[];

  constructor(
    private feedService: FeedService,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.feedService.all({
      fields: ['title', 'feedUrl'],
      search: 'subscribed:"true"',
      returnTotalCount: false,
    }).pipe(
        first()
    ).subscribe(feeds => {
      this.zone.run(() => {
        this.subscribedFeeds = feeds.objects;
      });
    });
  }
}
