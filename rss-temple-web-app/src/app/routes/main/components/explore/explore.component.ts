import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppAlertsService, HttpErrorService } from '@app/services';
import { ExploreService, FeedService } from '@app/services/data';

interface FeedDescriptor {
  name: string;
  imageSrc: string | null;
  homeUrl: string | null;
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
  standalone: false,
})
export class ExploreComponent implements OnInit, OnDestroy {
  tagEntries: TagEntry[] = [];

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private feedService: FeedService,
    private exploreService: ExploreService,
    private httpErrorService: HttpErrorService,
    private appAlertsService: AppAlertsService,
  ) {}

  ngOnInit() {
    this.exploreService
      .explore()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: tagDescriptors => {
          const tagEntries = tagDescriptors.map<TagEntry>(tagDescriptor => ({
            name: tagDescriptor.tagName,
            feeds: tagDescriptor.feeds.map(feedDescriptor => ({
              name: feedDescriptor.name,
              feedUrl: feedDescriptor.feedUrl,
              homeUrl: feedDescriptor.homeUrl,
              exampleTitles: feedDescriptor.entryTitles,
              imageSrc: feedDescriptor.imageSrc,
              isSubscribed: feedDescriptor.isSubscribed,
            })),
          }));

          this.zone.run(() => {
            this.tagEntries = tagEntries;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
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
