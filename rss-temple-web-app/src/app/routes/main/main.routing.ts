import { Routes } from '@angular/router';

import { ExploreComponent } from '@app/routes/main/components/explore/explore.component';
import { FeedComponent } from '@app/routes/main/components/feed/feed.component';
import { FeedsComponent } from '@app/routes/main/components/feeds/feeds.component';
import { ProfileComponent } from '@app/routes/main/components/profile/profile.component';
import { SearchEntriesComponent } from '@app/routes/main/components/search/search-entries/search-entries.component';
import { SearchFeedsComponent } from '@app/routes/main/components/search/search-feeds/search-feeds.component';
import { MainComponent } from '@app/routes/main/main.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'feeds' },
      { path: 'feeds', component: FeedsComponent },
      { path: 'feed/:url', component: FeedComponent },
      { path: 'explore', component: ExploreComponent },
      { path: 'search', pathMatch: 'full', redirectTo: 'search/entries' },
      {
        path: 'search/entries',
        component: SearchEntriesComponent,
      },
      {
        path: 'search/feeds',
        component: SearchFeedsComponent,
      },
      { path: 'profile', component: ProfileComponent },
    ],
  },
];
