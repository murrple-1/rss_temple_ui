import { TestBed, async } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { AppComponent } from '@app/app.component';
import { routing } from '@app/app.routing';
import { AuthGuard, NoAuthGuard } from '@app/_guards/auth.guard';
import {
  LoginService,
  AlertService,
  GAuthService,
  FBAuthService,
  HttpErrorService,
} from '@app/_services';
import {
  UserService,
  FeedService,
  FeedEntryService,
  OPMLService,
  ProgressService,
  UserCategoryService,
} from '@app/_services/data';
import { LoginComponent } from '@app/login/login.component';
import { RegisterComponent } from '@app/register/register.component';
import { MainComponent } from '@app/main/main.component';
import { FeedComponent } from '@app/main/feed/feed.component';
import { HeaderComponent } from '@app/main/_components/header/header.component';
import { FeedEntryViewComponent } from '@app/main/_components/feed-entry-view/feed-entry-view.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,

        NgbModule,

        SnackbarModule.forRoot(),

        routing,
      ],
      declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        MainComponent,
        FeedComponent,
        HeaderComponent,
        FeedEntryViewComponent,
      ],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },

        AuthGuard,
        NoAuthGuard,
        AlertService,
        LoginService,
        UserService,
        FeedService,
        FeedEntryService,
        OPMLService,
        ProgressService,
        UserCategoryService,
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
