import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { routing } from '@app/main/main.routing';
import { MainComponent } from '@app/main/main.component';
import { FeedsComponent } from '@app/main/feeds/feeds.component';
import { FeedComponent } from '@app/main/feed/feed.component';
import { SidebarComponent } from '@app/main/_components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/main/_components/header/header.component';
import { FeedEntryViewComponent } from '@app/main/_components/feed-entry-view/feed-entry-view.component';
import { SubscribeModalComponent as SidebarSubscribeModalComponent } from '@app/main/_components/sidebar/subscribemodal/subscribemodal.component';
import { OPMLModalComponent as SidebarOPMLModalComponent } from '@app/main/_components/sidebar/opmlmodal/opmlmodal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        NgbModalModule,

        routing,
    ],
    declarations: [
        MainComponent,
        FeedsComponent,
        FeedComponent,
        SidebarComponent,
        HeaderComponent,
        FeedEntryViewComponent,
        SidebarSubscribeModalComponent,
        SidebarOPMLModalComponent,
    ],
    entryComponents: [
        SidebarSubscribeModalComponent,
        SidebarOPMLModalComponent,
    ],
})
export class MainModule {}
