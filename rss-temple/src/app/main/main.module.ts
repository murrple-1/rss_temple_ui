import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { LayoutRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { SubscribeModalComponent as SidebarSubscribeModalComponent } from './_components/side-bar/subscribemodal/subscribemodal.component';
import { OPMLModalComponent as SidebarOPMLModalComponent } from './_components/side-bar/opmlmodal/opmlmodal.component';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        NgbDropdownModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        MainComponent,
        SidebarComponent,
        HeaderComponent,
        SidebarSubscribeModalComponent,
        SidebarOPMLModalComponent,
    ],
    entryComponents: [
        SidebarSubscribeModalComponent,
        SidebarOPMLModalComponent,
    ]
})
export class MainModule {}
