import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

import { forkJoin, Subject } from 'rxjs';
import { takeUntil, skip, map } from 'rxjs/operators';

import { FeedService } from '@app/services/data';
import { HttpErrorService, AppAlertsService } from '@app/services';

interface FeedDescriptor {
  name: string;
  imageSrc: string | null;
  homeUrl: string;
  feedUrl: string;
  exampleTitles: string[];
  isSubscribed: boolean;
}

interface TagEntry {
  name: string;
  feeds: FeedDescriptor[];
}

@Component({
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit, OnDestroy {
  tagEntries: TagEntry[] = [
    {
      name: 'American News',
      feeds: [
        {
          exampleTitles: ['Cat lives with dog', 'A Bad Day happened today'],
          feedUrl: '',
          homeUrl: '',
          imageSrc:
            'https://pbs.twimg.com/profile_banners/759251/1607983278/1080x360',
          isSubscribed: false,
          name: 'CNN News',
        },
        {
          exampleTitles: ['Cat lives with dog', 'A Bad Day happened today'],
          feedUrl: '',
          homeUrl: '',
          imageSrc: null,
          isSubscribed: false,
          name: 'CNN News',
        },
        {
          exampleTitles: ['Cat lives with dog', 'A Bad Day happened today'],
          feedUrl: '',
          homeUrl: '',
          imageSrc:
            'https://pbs.twimg.com/profile_banners/759251/1607983278/1080x360',
          isSubscribed: false,
          name: 'CNN News',
        },
        {
          exampleTitles: ['Cat lives with dog', 'A Bad Day happened today'],
          feedUrl: '',
          homeUrl: '',
          imageSrc: null,
          isSubscribed: false,
          name: 'CNN News',
        },
        {
          exampleTitles: ['Cat lives with dog', 'A Bad Day happened today'],
          feedUrl: '',
          homeUrl: '',
          imageSrc: null,
          isSubscribed: false,
          name: 'CNN News',
        },
      ],
    },
    {
      name: 'American News',
      feeds: [
        {
          exampleTitles: ['Cat lives with dog', 'A Bad Day happened today'],
          feedUrl: '',
          homeUrl: '',
          imageSrc:
            'https://pbs.twimg.com/profile_images/1278259160644227073/MfCyF7CG_400x400.jpg',
          isSubscribed: false,
          name: 'CNN News',
        },
        {
          exampleTitles: ['Cat lives with dog', 'A Bad Day happened today'],
          feedUrl: '',
          homeUrl: '',
          imageSrc: null,
          isSubscribed: false,
          name: 'CNN News',
        },
        {
          exampleTitles: ['Cat lives with dog', 'A Bad Day happened today'],
          feedUrl: '',
          homeUrl: '',
          imageSrc: null,
          isSubscribed: false,
          name: 'CNN News',
        },
      ],
    },
  ];

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private feedService: FeedService,
    private httpErrorService: HttpErrorService,
    private appAlertsService: AppAlertsService,
  ) {}

  ngOnInit() {
    // TODO implement
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  subscribe(feed: FeedDescriptor) {
    console.log(feed.feedUrl);
    feed.isSubscribed = true;
  }

  unsubscribe(feed: FeedDescriptor) {
    console.log(feed.feedUrl);
    feed.isSubscribed = false;
  }
}
