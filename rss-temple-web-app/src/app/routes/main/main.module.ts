import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ShareModule } from 'ngx-sharebuttons';

import { AppSharedModule } from '@app/app-shared.module';
import { ExploreComponent } from '@app/routes/main/components/explore/explore.component';
import { FeedComponent } from '@app/routes/main/components/feed/feed.component';
import { UserCategoriesModalComponent } from '@app/routes/main/components/feed/user-categories-modal/user-categories-modal.component';
import { FeedsComponent } from '@app/routes/main/components/feeds/feeds.component';
import { OnboardingModalComponent } from '@app/routes/main/components/onboarding-modal/onboarding-modal.component';
import { DeleteUserConfirm1ModalComponent } from '@app/routes/main/components/profile/delete-user-confirm1-modal/delete-user-confirm1-modal.component';
import { DeleteUserConfirm2ModalComponent } from '@app/routes/main/components/profile/delete-user-confirm2-modal/delete-user-confirm2-modal.component';
import { GlobalUserCategoriesModalComponent } from '@app/routes/main/components/profile/global-user-categories-modal/global-user-categories-modal.component';
import { ProfileComponent } from '@app/routes/main/components/profile/profile.component';
import { SearchComponent } from '@app/routes/main/components/search/search.component';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';
import { FeedsFooterComponent } from '@app/routes/main/components/shared/feeds-footer/feeds-footer.component';
import { LabelVoteModalComponent } from '@app/routes/main/components/shared/label-vote-modal/label-vote-modal.component';
import { ShareModalComponent } from '@app/routes/main/components/shared/share-modal/share-modal.component';
import { ExposedFeedsModalComponent as VerticalNavExposedFeedsModalComponent } from '@app/routes/main/components/shared/vertical-nav/exposed-feeds-modal/exposed-feeds-modal.component';
import { OPMLModalComponent as VerticalNavOPMLModalComponent } from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';
import { SubscribeModalComponent as VerticalNavSubscribeModalComponent } from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import { VerticalNavComponent } from '@app/routes/main/components/shared/vertical-nav/vertical-nav.component';
import { InfiniteScrollDirective } from '@app/routes/main/directives/infinite-scroll.directive';
import { InViewportDirective } from '@app/routes/main/directives/inviewport.directive';
import { MainComponent } from '@app/routes/main/main.component';
import { routes } from '@app/routes/main/main.routing';
import {
  FeedEntryVoteService,
  FeedObservableService,
  ReadCounterService,
  UserCategoryObservableService,
} from '@app/routes/main/services';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    ClarityModule,

    ShareModule,

    AppSharedModule,

    RouterModule.forChild(routes),
  ],
  providers: [
    FeedObservableService,
    UserCategoryObservableService,
    ReadCounterService,
    FeedEntryVoteService,
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
    GlobalUserCategoriesModalComponent,
    DeleteUserConfirm1ModalComponent,
    DeleteUserConfirm2ModalComponent,
    VerticalNavComponent,
    FeedEntryViewComponent,
    ShareModalComponent,
    LabelVoteModalComponent,
    VerticalNavSubscribeModalComponent,
    VerticalNavOPMLModalComponent,
    VerticalNavExposedFeedsModalComponent,
  ],
})
export class MainModule {}
