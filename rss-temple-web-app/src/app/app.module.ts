import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  ClarityIcons,
  bookIcon,
  bookmarkIcon,
  clipboardIcon,
  envelopeIcon,
  exclamationCircleIcon,
  exclamationTriangleIcon,
  flaskIcon,
  folderIcon,
  libraryIcon,
  lightbulbIcon,
  linkIcon,
  logoutIcon,
  minusIcon,
  playIcon,
  plusIcon,
  refreshIcon,
  searchIcon,
  shareIcon,
  starIcon,
  stopIcon,
  talkBubblesIcon,
  uploadIcon,
  windowCloseIcon,
} from '@cds/core/icon';
import { IconShapeTuple } from '@cds/core/icon/interfaces/icon.interfaces';
import '@cds/core/icon/register.js';
import { ClarityModule } from '@clr/angular';
import { CookieService } from 'ngx-cookie-service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';

import { AppSharedModule } from '@app/app-shared.module';
import { AppComponent } from '@app/app.component';
import { routes } from '@app/app.routing';
import { AppAlertsComponent } from '@app/components/app-alerts/app-alerts.component';
import { CookieConsentSnackbarComponent } from '@app/components/cookie-consent-snackbar/cookie-consent-snackbar.component';
import { LoginComponent } from '@app/components/login/login.component';
import { RequestPasswordResetModalComponent as LoginRequestPasswordResetModalComponent } from '@app/components/login/request-password-reset-modal/request-password-reset-modal.component';
import { NavComponent } from '@app/components/nav/nav.component';
import { SearchModalComponent } from '@app/components/nav/search-modal/search-modal.component';
import { RegisterComponent } from '@app/components/register/register.component';
import { ResetPasswordComponent } from '@app/components/reset-password/reset-password.component';
import { SubNavComponent } from '@app/components/subnav/subnav.component';
import { SupportComponent } from '@app/components/support/support.component';
import { VerifyComponent } from '@app/components/verify/verify.component';
import { ConfigService } from '@app/services';

export function clarityIconsFactory(http: HttpClient) {
  return async () => {
    ClarityIcons.addIcons(
      exclamationCircleIcon,
      windowCloseIcon,
      exclamationTriangleIcon,
      exclamationCircleIcon,
      folderIcon,
      plusIcon,
      uploadIcon,
      logoutIcon,
      starIcon,
      minusIcon,
      libraryIcon,
      playIcon,
      stopIcon,
      refreshIcon,
      shareIcon,
      clipboardIcon,
      envelopeIcon,
      talkBubblesIcon,
      searchIcon,
      flaskIcon,
      bookIcon,
      linkIcon,
      bookmarkIcon,
      lightbulbIcon,
    );

    const myCollectionIconDownloads = await firstValueFrom(
      forkJoin({
        'app-logo': http
          .get('/assets/images/icon.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-facebook': http
          .get('/assets/custom_cds_icon_svgs/facebook-f.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-google': http
          .get('/assets/custom_cds_icon_svgs/google.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-twitter-x': http
          .get('/assets/custom_cds_icon_svgs/twitter-x.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-linkedin': http
          .get('/assets/custom_cds_icon_svgs/linkedin.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-pinterest': http
          .get('/assets/custom_cds_icon_svgs/pinterest.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-reddit': http
          .get('/assets/custom_cds_icon_svgs/reddit.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-tumblr': http
          .get('/assets/custom_cds_icon_svgs/tumblr.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-telegram': http
          .get('/assets/custom_cds_icon_svgs/telegram.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-facebook-messenger': http
          .get('/assets/custom_cds_icon_svgs/facebook-messenger.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-whatsapp': http
          .get('/assets/custom_cds_icon_svgs/whatsapp.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'book-strikethrough': http
          .get('/assets/custom_cds_icon_svgs/book-strikethrough.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'star-filled': http
          .get('/assets/custom_cds_icon_svgs/star-filled.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
      }),
    );
    const myCollectionIcons: IconShapeTuple[] = [];
    for (const [key, value] of Object.entries(myCollectionIconDownloads)) {
      if (value !== null) {
        myCollectionIcons.push([key, value]);
      }
    }
    ClarityIcons.addIcons(...myCollectionIcons);
  };
}

export function configFactory(configService: ConfigService) {
  return () => configService.load();
}

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    SearchModalComponent,
    SubNavComponent,
    AppAlertsComponent,
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    LoginRequestPasswordResetModalComponent,
    VerifyComponent,
    SupportComponent,
    CookieConsentSnackbarComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ClarityModule,
    AppSharedModule,
    RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' }),
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: APP_INITIALIZER,
      useFactory: clarityIconsFactory,
      multi: true,
      deps: [HttpClient],
    },
    CookieService,
    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      multi: true,
      deps: [ConfigService],
    },
  ],
})
export class AppModule {}
