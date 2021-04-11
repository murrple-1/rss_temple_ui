import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

import { forkJoin, Subject } from 'rxjs';
import { takeUntil, skip, map } from 'rxjs/operators';

import { FeedService } from '@app/services/data';
import { HttpErrorService, AppAlertsService } from '@app/services';

interface TagEntry {
  name: string;
  feeds: {
    name: string;
    imageSrc: string | null;
    homeUrl: string;
    feedUrl: string;
    exampleTitles: string[];
    isSubscribed: boolean;
  }[];
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

  subscribe(feedUrl: string) {
    console.log(feedUrl);
  }

  unsubscribe(feedUrl: string) {
    console.log(feedUrl);
  }
}
