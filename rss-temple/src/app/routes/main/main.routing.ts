import { Routes } from '@angular/router';

import { MainComponent } from '@app/routes/main/main.component';
import { FeedsComponent } from '@app/routes/main/components/feeds/feeds.component';
import { FeedComponent } from '@app/routes/main/components/feed/feed.component';
import { ExploreComponent } from '@app/routes/main/components/explore/explore.component';
import { SearchAllComponent } from '@app/routes/main/components/search/search-all/search-all.component';
import { SearchEntriesComponent } from '@app/routes/main/components/search/search-entries/search-entries.component';
import { SearchFeedsComponent } from '@app/routes/main/components/search/search-feeds/search-feeds.component';
import { AdvancedSearchComponent } from '@app/routes/main/components/search/advanced-search/advanced-search.component';
import { ProfileComponent } from '@app/routes/main/components/profile/profile.component';
import { SupportComponent } from '@app/routes/main/components/support/support.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'feeds' },
      { path: 'feeds', component: FeedsComponent },
      { path: 'feed/:url', component: FeedComponent },
      { path: 'explore', component: ExploreComponent },
      {
        path: 'search',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'all',
          },
          {
            path: 'all',
            component: SearchAllComponent,
          },
          {
            path: 'entries',
            component: SearchEntriesComponent,
          },
          {
            path: 'feeds',
            component: SearchFeedsComponent,
          },
          {
            path: 'advanced',
            component: AdvancedSearchComponent,
          },
        ],
      },
      { path: 'profile', component: ProfileComponent },
      { path: 'support', component: SupportComponent },
    ],
  },
];
