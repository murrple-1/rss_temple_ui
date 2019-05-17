import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import {
  NgbModalModule,
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { routing } from '@app/routes/main/main.routing';
import { MainComponent } from '@app/routes/main/main.component';
import { FeedsComponent } from '@app/routes/main/components/feeds/feeds.component';
import { FeedComponent } from '@app/routes/main/components/feed/feed.component';
import { UserCategoriesModalComponent } from '@app/routes/main/components/feed/usercategoriesmodal/usercategoriesmodal.component';
import { ProfileComponent } from '@app/routes/main/components/profile/profile.component';
import { HeaderComponent } from '@app/routes/main/components/shared/header/header.component';
import { FeedEntryViewComponent } from '@app/routes/main/components/shared/feed-entry-view/feed-entry-view.component';
import { SubscribeModalComponent as HeaderSubscribeModalComponent } from '@app/routes/main/components/shared/header/subscribemodal/subscribemodal.component';
import { OPMLModalComponent as HeaderOPMLModalComponent } from '@app/routes/main/components/shared/header/opmlmodal/opmlmodal.component';
import { InViewportDirective } from '@app/directives/inviewport.directive';
import {
  FeedObservableService,
  CurrentFeedEntryService,
} from '@app/routes/main/services';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NgbModalModule,
    NgbCollapseModule,
    NgbDropdownModule,

    InfiniteScrollModule,

    routing,
  ],
  providers: [FeedObservableService, CurrentFeedEntryService],
  declarations: [
    MainComponent,
    FeedsComponent,
    FeedComponent,
    UserCategoriesModalComponent,
    ProfileComponent,
    HeaderComponent,
    FeedEntryViewComponent,
    HeaderSubscribeModalComponent,
    HeaderOPMLModalComponent,

    InViewportDirective,
  ],
  entryComponents: [
    HeaderSubscribeModalComponent,
    HeaderOPMLModalComponent,
    UserCategoriesModalComponent,
  ],
})
export class MainModule {}
