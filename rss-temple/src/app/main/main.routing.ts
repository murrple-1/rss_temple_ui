import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from '@app/main/main.component';
import { FeedsComponent } from '@app/main/feeds/feeds.component';
import { FeedComponent } from '@app/main/feed/feed.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        children: [
            { path: '', component: FeedsComponent },
            { path: 'feed', component: FeedComponent },
        ]
    }
];

export const routing = RouterModule.forChild(routes);
