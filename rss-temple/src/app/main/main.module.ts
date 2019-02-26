import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import {
  NgbModalModule,
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { routing } from '@app/main/main.routing';
import { MainComponent } from '@app/main/main.component';
import { FeedsComponent } from '@app/main/feeds/feeds.component';
import { FeedComponent } from '@app/main/feed/feed.component';
import { ProfileComponent } from '@app/main/profile/profile.component';
import { HeaderComponent } from '@app/main/_components/header/header.component';
import { FeedEntryViewComponent } from '@app/main/_components/feed-entry-view/feed-entry-view.component';
import { SubscribeModalComponent as HeaderSubscribeModalComponent } from '@app/main/_components/header/subscribemodal/subscribemodal.component';
import { OPMLModalComponent as HeaderOPMLModalComponent } from '@app/main/_components/header/opmlmodal/opmlmodal.component';
import { InViewportDirective } from '@app/_directives/inviewport.directive';

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
  declarations: [
    MainComponent,
    FeedsComponent,
    FeedComponent,
    ProfileComponent,
    HeaderComponent,
    FeedEntryViewComponent,
    HeaderSubscribeModalComponent,
    HeaderOPMLModalComponent,

    InViewportDirective,
  ],
  entryComponents: [HeaderSubscribeModalComponent, HeaderOPMLModalComponent],
})
export class MainModule {}
