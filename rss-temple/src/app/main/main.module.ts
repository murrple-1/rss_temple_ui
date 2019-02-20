import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import {
  NgbModalModule,
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';

import { routing } from '@app/main/main.routing';
import { MainComponent } from '@app/main/main.component';
import { FeedsComponent } from '@app/main/feeds/feeds.component';
import { FeedComponent } from '@app/main/feed/feed.component';
import { HeaderComponent } from '@app/main/_components/header/header.component';
import { FeedEntryViewComponent } from '@app/main/_components/feed-entry-view/feed-entry-view.component';
import { SubscribeModalComponent as HeaderSubscribeModalComponent } from '@app/main/_components/header/subscribemodal/subscribemodal.component';
import { OPMLModalComponent as HeaderOPMLModalComponent } from '@app/main/_components/header/opmlmodal/opmlmodal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NgbModalModule,
    NgbCollapseModule,
    NgbDropdownModule,

    routing,
  ],
  declarations: [
    MainComponent,
    FeedsComponent,
    FeedComponent,
    HeaderComponent,
    FeedEntryViewComponent,
    HeaderSubscribeModalComponent,
    HeaderOPMLModalComponent,
  ],
  entryComponents: [HeaderSubscribeModalComponent, HeaderOPMLModalComponent],
})
export class MainModule {}
