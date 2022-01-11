import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ClarityModule } from '@clr/angular';

import { AppSharedModule } from '@app/app-shared.module';

import { routes } from '@app/routes/main/main.routing';

import {
  FeedObservableService,
  UserCategoryObservableService,
  ReadCounterService,
} from '@app/routes/main/services';

import { InViewportDirective } from '@app/routes/main/directives/inviewport.directive';
import { InfiniteScrollDirective } from '@app/routes/main/directives/infinite-scroll.directive';

import { MainComponent } from '@app/routes/main/main.component';
import { OnboardingModalComponent } from '@app/routes/main/components/onboarding-modal/onboarding-modal.component';
import { FeedsComponent } from '@app/routes/main/components/feeds/feeds.component';
import { FeedComponent } from '@app/routes/main/components/feed/feed.component';
import { UserCategoriesModalComponent } from '@app/routes/main/components/feed/user-categories-modal/user-categories-modal.component';
import { FeedsFooterComponent } from '@app/routes/main/components/shared/feeds-footer/feeds-footer.component';
import { ExploreComponent } from '@app/routes/main/components/explore/explore.component';
import { SearchComponent } from '@app/routes/main/components/search/search.component';
import { ProfileComponent } from '@app/routes/main/components/profile/profile.component';
import { SupportComponent } from '@app/routes/main/components/support/support.component';
import { GlobalUserCategoriesModalComponent } from '@app/routes/main/components/profile/global-user-categories-modal/global-user-categories-modal.component';
import { VerticalNavComponent } from '@app/routes/main/components/shared/vertical-nav/vertical-nav.component';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';
import { SubscribeModalComponent as HeaderSubscribeModalComponent } from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import { OPMLModalComponent as HeaderOPMLModalComponent } from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    ClarityModule,

    AppSharedModule,

    RouterModule.forChild(routes),
  ],
  providers: [
    FeedObservableService,
    UserCategoryObservableService,
    ReadCounterService,
  ],
  declarations: [
    InViewportDirective,
    InfiniteScrollDirective,

    MainComponent,
    OnboardingModalComponent,
    FeedsComponent,
    FeedComponent,
    FeedsFooterComponent,
    UserCategoriesModalComponent,
    ExploreComponent,
    SearchComponent,
    ProfileComponent,
    SupportComponent,
    GlobalUserCategoriesModalComponent,
    VerticalNavComponent,
    FeedEntryViewComponent,
    HeaderSubscribeModalComponent,
    HeaderOPMLModalComponent,
  ],
})
export class MainModule {}
