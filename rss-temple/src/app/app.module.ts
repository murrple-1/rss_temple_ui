import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';

import { AppComponent } from '@app/app.component';
import { routing } from '@app/app.routing';
import { AlertComponent } from '@app/_directives/alert.component';
import { AuthGuard, NoAuthGuard } from '@app/_guards/auth.guard';
import { LoginService } from '@app/_services/login.service';
import { AlertService } from '@app/_services/alert.service';
import { UserService } from '@app/_services/user.service';
import { GAuthService } from '@app/_services/gauth.service';
import { FBAuthService } from '@app/_services/fbauth.service';
import { LoginComponent } from '@app/login/login.component';
import { RegisterComponent } from '@app/register/register.component';
import { MainComponent } from '@app/main/main.component';
import { FeedService } from '@app/_services/feed.service';
import { FeedEntryService } from '@app/_services/feedentry.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,

        ButtonModule,

        routing,
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        LoginComponent,
        RegisterComponent,
        MainComponent,
    ],
    providers: [
        AuthGuard,
        NoAuthGuard,
        AlertService,
        LoginService,
        UserService,
        FeedService,
        FeedEntryService,
        GAuthService,
        FBAuthService,
    ],
    bootstrap: [
        AppComponent,
    ],
})
export class AppModule { }
