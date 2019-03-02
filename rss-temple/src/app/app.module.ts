import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from '@app/app.component';
import { routing } from '@app/app.routing';
import { AlertComponent } from '@app/_components/alert/alert.component';
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
import { RegisterComponent } from '@app/register/register.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    NgbDropdownModule,

    routing,
  ],
  declarations: [
    AppComponent,
    AlertComponent,
    LoginComponent,
    RegisterComponent,
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
  bootstrap: [AppComponent],
})
export class AppModule {}
