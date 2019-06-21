import { TestBed, async } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';

import { NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { AppComponent } from '@app/app.component';
import { routing } from '@app/app.routing';
import { AuthGuard, NoAuthGuard } from '@app/guards/auth.guard';
import {
  LoginService,
  AlertService,
  GAuthService,
  FBAuthService,
  HttpErrorService,
} from '@app/services';
import {
  UserService,
  FeedService,
  FeedEntryService,
  OPMLService,
  ProgressService,
  UserCategoryService,
  PasswordResetTokenService,
} from '@app/services/data';
import { LoginComponent } from '@app/components/login/login.component';
import { RegisterComponent } from '@app/components/register/register.component';
import { ResetPasswordComponent } from '@app/components/resetpassword/resetpassword.component';
import { VerifyComponent } from '@app/components/verify/verify.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,

        NgbDropdownModule,
        NgbModalModule,

        SnackbarModule.forRoot(),

        routing,
      ],
      declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        ResetPasswordComponent,
        VerifyComponent,
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
        PasswordResetTokenService,
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
