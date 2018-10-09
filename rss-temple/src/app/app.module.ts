import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { AlertComponent } from './_directives/alert.component';
import { AuthGuard, NoAuthGuard } from './_guards/auth.guard';
import { LoginService } from './_services/login.service';
import { AlertService } from './_services/alert.service';
import { UserService } from './_services/user.service';
import { GAuthService } from './_services/gauth.service';
import { FBAuthService } from './_services/fbauth.service';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MainComponent } from './main/main.component';
import { FeedService } from './_services/feed.service';
import { FeedEntryService } from './_services/feedentry.service';

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
