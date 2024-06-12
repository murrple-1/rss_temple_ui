import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ClrLoadingState } from '@clr/angular';
import { combineLatest, of } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { Feed } from '@app/models';
import { HttpErrorService, SubNavLinksService } from '@app/services';
import { FeedService } from '@app/services/data';

import { AbstractSearchComponent } from '../abstract-search.component';

type FeedImpl = Required<Pick<Feed, 'title' | 'feedUrl' | 'homeUrl'>>;

interface FeedDescriptor {
  title: string;
  feedUrl: string;
  homeUrl: string | null;
}

enum LoadingState {
  IsLoading,
  IsNotLoading,
  NoMoreToLoad,
}

const Count = 10;

@Component({
  templateUrl: './search-feeds.component.html',
  styleUrls: ['./search-feeds.component.scss'],
})
export class SearchFeedsComponent
  extends AbstractSearchComponent
  implements OnInit
{
  searchTitle = '';
  searchButtonState = ClrLoadingState.DEFAULT;

  feedDescriptors: FeedDescriptor[] = [];

  constructor(
    zone: NgZone,
    router: Router,
    route: ActivatedRoute,
    subnavLinksService: SubNavLinksService,
    private feedService: FeedService,
    private httpErrorService: HttpErrorService,
  ) {
    super(zone, router, route, subnavLinksService);
  }

  ngOnInit() {
    super.ngOnInit();

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
              this.searchTitle = searchText;
            });

            this.updateSearch();
          }
        },
      });
  }

  private doSearch(title: string, count: number, skip: number) {
    title = SearchFeedsComponent.cleanAndEscapeText(title);

    const searchParts: string[] = [];
    if (title.length > 0) {
      searchParts.push(`calculatedTitle:"${title}"`);
    }

    let search: string;
    if (searchParts.length > 0) {
      search = searchParts.join(' and ');
    } else {
      return of([]);
    }

    return this.feedService
      .query({
        fields: ['title', 'feedUrl', 'homeUrl'],
        count,
        skip,
        returnTotalCount: false,
        search,
      })
      .pipe(
        map(response => {
          if (response.objects !== undefined) {
            return response.objects as FeedImpl[];
          }
          throw new Error('malformed response');
        }),
        map(feeds => {
          for (const feed of feeds) {
            let title_ = feed.title.trim();
            if (title_.length < 1) {
              title_ = '[No Title]';
            }
            feed.title = title_;
          }
          return feeds;
        }),
        map(feeds =>
          feeds.map<FeedDescriptor>(f => ({
            title: f.title,
            feedUrl: f.feedUrl,
            homeUrl: f.homeUrl,
          })),
        ),
      );
  }

  updateSearch() {
    this.feedDescriptors = [];

    this.loadingState = LoadingState.IsLoading;
    this.searchButtonState = ClrLoadingState.LOADING;

    this.doSearch(this.searchTitle, Count, 0)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feedDescriptors => {
          this.zone.run(() => {
            this.loadingState =
              feedDescriptors.length < Count
                ? LoadingState.NoMoreToLoad
                : LoadingState.IsNotLoading;
            this.searchButtonState = ClrLoadingState.SUCCESS;
            this.feedDescriptors = feedDescriptors;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.loadingState = LoadingState.IsNotLoading;
            this.searchButtonState = ClrLoadingState.ERROR;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }

  loadMore() {
    this.loadingState = LoadingState.IsLoading;
    this.searchButtonState = ClrLoadingState.LOADING;

    this.doSearch(this.searchTitle, Count, this.feedDescriptors.length)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: feedDescriptors => {
          const feedDescriptors_ = [
            ...this.feedDescriptors,
            ...feedDescriptors,
          ];

          this.zone.run(() => {
            this.loadingState =
              feedDescriptors.length < Count
                ? LoadingState.NoMoreToLoad
                : LoadingState.IsNotLoading;
            this.searchButtonState = ClrLoadingState.SUCCESS;
            this.feedDescriptors = feedDescriptors_;
          });
        },
        error: error => {
          this.zone.run(() => {
            this.loadingState = LoadingState.IsNotLoading;
            this.searchButtonState = ClrLoadingState.ERROR;
          });
          this.httpErrorService.handleError(error);
        },
      });
  }
}
