import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ClarityModule } from '@clr/angular';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AppSharedModule } from '@app/app-shared.module';

import { routes } from '@app/routes/main/main.routing';

import { FeedObservableService } from '@app/routes/main/services';

import { InViewportDirective } from '@app/directives/inviewport.directive';

import { MainComponent } from '@app/routes/main/main.component';
import { FeedsComponent } from '@app/routes/main/components/feeds/feeds.component';
import { FeedComponent } from '@app/routes/main/components/feed/feed.component';
import { UserCategoriesModalComponent } from '@app/routes/main/components/feed/user-categories-modal/user-categories-modal.component';
import { ProfileComponent } from '@app/routes/main/components/profile/profile.component';
import { VerticalNavComponent } from '@app/routes/main/components/shared/vertical-nav/vertical-nav.component';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';
import { SubscribeModalComponent as HeaderSubscribeModalComponent } from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import { OPMLModalComponent as HeaderOPMLModalComponent } from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    ClarityModule,

    InfiniteScrollModule,

    AppSharedModule,

    RouterModule.forChild(routes),
  ],
  providers: [FeedObservableService],
  declarations: [
    InViewportDirective,

    MainComponent,
    FeedsComponent,
    FeedComponent,
    UserCategoriesModalComponent,
    ProfileComponent,
    VerticalNavComponent,
    FeedEntryViewComponent,
    HeaderSubscribeModalComponent,
    HeaderOPMLModalComponent,
  ],
})
export class MainModule {}
