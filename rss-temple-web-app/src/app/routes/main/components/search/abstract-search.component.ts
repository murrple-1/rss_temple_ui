import { Directive, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, combineLatest, startWith, takeUntil } from 'rxjs';

import { SubNavLinksService } from '@app/services';

enum LoadingState {
  IsLoading,
  IsNotLoading,
  NoMoreToLoad,
}

@Directive()
export abstract class AbstractSearchComponent implements OnInit, OnDestroy {
  protected zone = inject(NgZone);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected subnavLinksService = inject(SubNavLinksService);

  readonly LoadingState = LoadingState;
  loadingState = LoadingState.IsNotLoading;

  protected readonly unsubscribe$ = new Subject<void>();

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
            this.subnavLinksService.subNavLinks$.next([
              {
                text: 'Entries',
                routerLink: ['/main/search/entries', { searchText }],
              },
              {
                text: 'Feeds',
                routerLink: ['/main/search/feeds', { searchText }],
              },
            ]);
          }
        },
      });
  }

  ngOnDestroy() {
    this.subnavLinksService.subNavLinks$.next([]);

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  protected static cleanAndEscapeText(t: string) {
    return t
      .trim()
      .replace('"', '\\"')
      .replace('\n', '\\n')
      .replace('\t', '\\t');
  }
}
