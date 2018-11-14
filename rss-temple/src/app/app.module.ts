import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from '@app/app.component';
import { routing } from '@app/app.routing';
import { AlertComponent } from '@app/_directives/alert.component';
import { AuthGuard, NoAuthGuard } from '@app/_guards/auth.guard';
import { LoginService } from '@app/_services/login.service';
import { AlertService } from '@app/_services/alert.service';
import { UserService } from '@app/_services/data/user.service';
import { GAuthService } from '@app/_services/gauth.service';
import { FBAuthService } from '@app/_services/fbauth.service';
import { HttpErrorService } from '@app/_services/httperror.service';
import { LoginComponent } from '@app/login/login.component';
import { RegisterComponent } from '@app/register/register.component';
import { MainComponent } from '@app/main/main.component';
import { FeedComponent } from '@app/feed/feed.component';
import { FeedService } from '@app/_services/data/feed.service';
import { FeedEntryService } from '@app/_services/data/feedentry.service';
import { UserCategoryService } from './_services/data/usercategory.service';
import { NavBarComponent } from '@app/_components/nav-bar/nav-bar.component';
import { SideBarComponent } from '@app/_components/side-bar/side-bar.component';
import { FeedEntryViewComponent } from '@app/_components/feed-entry-view/feed-entry-view.component';
import { OptionsModalComponent as FeedOptionsModalComponent } from '@app/feed/optionsmodal/optionsmodal.component';
import { SubscribeModalComponent as SidebarSubscribeModalComponent } from '@app/_components/side-bar/subscribemodal/subscribemodal.component';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,

        InputTextModule,
        ButtonModule,
        DropdownModule,

        NgbModule,

        routing,
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        LoginComponent,
        RegisterComponent,
        MainComponent,
        FeedComponent,
        FeedOptionsModalComponent,
        NavBarComponent,
        SideBarComponent,
        SidebarSubscribeModalComponent,
        FeedEntryViewComponent,
    ],
    providers: [
        AuthGuard,
        NoAuthGuard,
        AlertService,
        LoginService,
        UserService,
        FeedService,
        FeedEntryService,
        UserCategoryService,
        GAuthService,
        FBAuthService,
        HttpErrorService,
    ],
    bootstrap: [
        AppComponent,
    ],
    entryComponents: [
        FeedOptionsModalComponent,
        SidebarSubscribeModalComponent,
    ]
})
export class AppModule { }
