import { TestBed, async } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';

import { ButtonModule } from 'primeng/button';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from '@app/app.component';
import { routing } from '@app/app.routing';
import { AlertComponent } from '@app/_components/alert/alert.component';
import { AuthGuard, NoAuthGuard } from '@app/_guards/auth.guard';
import { LoginService } from '@app/_services/login.service';
import { AlertService } from '@app/_services/alert.service';
import { UserService } from '@app/_services/data/user.service';
import { GAuthService } from '@app/_services/gauth.service';
import { FBAuthService } from '@app/_services/fbauth.service';
import { HttpErrorService } from './_services/httperror.service';
import { LoginComponent } from '@app/login/login.component';
import { RegisterComponent } from '@app/register/register.component';
import { MainComponent } from '@app/main/main.component';
import { FeedComponent } from '@app/feed/feed.component';
import { FeedService } from '@app/_services/data/feed.service';
import { FeedEntryService } from '@app/_services/data/feedentry.service';
import { NavBarComponent } from '@app/_components/nav-bar/nav-bar.component';
import { SideBarComponent } from '@app/_components/side-bar/side-bar.component';
import { FeedEntryViewComponent } from '@app/_components/feed-entry-view/feed-entry-view.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,

        ButtonModule,

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
        NavBarComponent,
        SideBarComponent,
        FeedEntryViewComponent,
      ],
      providers: [
          {
            provide: APP_BASE_HREF,
            useValue : '/'
          },

          AuthGuard,
          NoAuthGuard,
          AlertService,
          LoginService,
          UserService,
          FeedService,
          FeedEntryService,
          GAuthService,
          FBAuthService,
          HttpErrorService,
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
