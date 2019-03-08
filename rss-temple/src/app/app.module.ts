import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { AppComponent } from '@app/app.component';
import { routing } from '@app/app.routing';
import { AuthGuard, NoAuthGuard } from '@app/_guards/auth.guard';
import {
  AlertService,
  FBAuthService,
  GAuthService,
  HttpErrorService,
  LoginService,
} from '@app/_services';
import {
  FeedEntryService,
  FeedService,
  OPMLService,
  ProgressService,
  UserCategoryService,
  UserService,
} from '@app/_services/data';
import { LoginComponent } from '@app/login/login.component';
import { RequestPasswordResetModalComponent as LoginRequestPasswordResetModalComponent } from '@app/login/requestpasswordresetmodal/requestpasswordresetmodal.component';
import { RegisterComponent } from '@app/register/register.component';
import { ResetPasswordComponent } from '@app/resetpassword/resetpassword.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

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
    GAuthService,
    FBAuthService,
    HttpErrorService,
  ],
  entryComponents: [LoginRequestPasswordResetModalComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
