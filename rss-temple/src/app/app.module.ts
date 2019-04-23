﻿import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { routing } from '@app/app.routing';
import { AppComponent } from '@app/app.component';
import { AuthGuard, NoAuthGuard } from '@app/guards/auth.guard';
import {
  AlertService,
  FBAuthService,
  GAuthService,
  HttpErrorService,
  LoginService,
} from '@app/services';
import {
  FeedEntryService,
  FeedService,
  OPMLService,
  ProgressService,
  UserCategoryService,
  UserService,
  PasswordResetTokenService,
} from '@app/services/data';
import { LoginComponent } from '@app/components/login/login.component';
import { RequestPasswordResetModalComponent as LoginRequestPasswordResetModalComponent } from '@app/components/login/requestpasswordresetmodal/requestpasswordresetmodal.component';
import { RegisterComponent } from '@app/components/register/register.component';
import { ResetPasswordComponent } from '@app/components/resetpassword/resetpassword.component';
import { VerifyComponent } from '@app/components/verify/verify.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    NgbModalModule,
    NgbDropdownModule,

    SnackbarModule.forRoot(),

    routing,
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    LoginRequestPasswordResetModalComponent,
    VerifyComponent,
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
    OPMLService,
    ProgressService,
    PasswordResetTokenService,
    GAuthService,
    FBAuthService,
    HttpErrorService,
  ],
  entryComponents: [LoginRequestPasswordResetModalComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
