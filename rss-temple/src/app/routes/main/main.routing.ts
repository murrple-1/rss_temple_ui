import { Routes } from '@angular/router';

import { MainComponent } from '@app/routes/main/main.component';
import { FeedsComponent } from '@app/routes/main/components/feeds/feeds.component';
import { FeedComponent } from '@app/routes/main/components/feed/feed.component';
import { ProfileComponent } from '@app/routes/main/components/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'feeds' },
      { path: 'feeds', component: FeedsComponent },
      { path: 'feed/:url', component: FeedComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
];
