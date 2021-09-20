import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { combineLatest, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { Feed } from '@app/models';
import { FeedService } from '@app/services/data';
import { HttpErrorService } from '@app/services';

type FeedImpl = Required<Pick<Feed, 'title' | 'feedUrl' | 'homeUrl'>>;

interface FeedDescriptor {
  title: string;
  feedUrl: string;
  homeUrl: string | null;
}

@Component({
  templateUrl: './search-feeds.component.html',
  styleUrls: ['./search-feeds.component.scss'],
})
export class SearchFeedsComponent implements OnInit, OnDestroy {
  readonly maxEntries = 12;

  searchText = '';

  isSearching = false;

  feedDescriptors: FeedDescriptor[] = [];

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private feedService: FeedService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnInit() {
    combineLatest([
      this.route.paramMap.pipe(startWith(undefined)),
      this.router.events.pipe(startWith(undefined)),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ([paramMap, navigationEvent]) => {
          if (
            paramMap !== undefined &&
            (navigationEvent === undefined ||
              navigationEvent instanceof NavigationEnd)
          ) {
            const searchText = paramMap.get('searchText') ?? '';
            this.zone.run(() => {
              this.searchText = searchText;
            });

            this.reload();
          }
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private reload() {
    this.feedDescriptors = [];

    const searchText = this.searchText;
    if (searchText.length < 1) {
      return;
    }

    this.isSearching = true;

    this.feedService
      .query({
        fields: ['title', 'feedUrl', 'homeUrl'],
        count: this.maxEntries,
        returnTotalCount: false,
        search: `title:"${searchText}"`,
      })
      .pipe(
        map(response => {
          if (response.objects !== undefined) {
            return response.objects as FeedImpl[];
          }
          throw new Error('malformed response');
        }),
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feeds => {
          const feedDescriptors = feeds.map<FeedDescriptor>(f => ({
            title: f.title,
            feedUrl: f.feedUrl,
            homeUrl: f.homeUrl,
          }));

          this.zone.run(() => {
            this.isSearching = false;
            this.feedDescriptors = feedDescriptors;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.isSearching = false;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }

  goTo(feedUrl: string) {
    this.router.navigate(['/main/feed', feedUrl]);
  }
}
