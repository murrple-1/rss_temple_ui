import {
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

import AppLogoSVG from '@app/../assets/images/icon.svg';
import BookStrikethroughSVG from '@app/../custom_cds_icon_svgs/book-strikethrough.svg';
import FacebookLogoSVG from '@app/../custom_cds_icon_svgs/facebook-f.svg';
import FacebookMessengerLogoSVG from '@app/../custom_cds_icon_svgs/facebook-messenger.svg';
import GoogleLogoSVG from '@app/../custom_cds_icon_svgs/google.svg';
import LinkedInLogoSVG from '@app/../custom_cds_icon_svgs/linkedin.svg';
import PinterestLogoSVG from '@app/../custom_cds_icon_svgs/pinterest.svg';
import RedditLogoSVG from '@app/../custom_cds_icon_svgs/reddit.svg';
import StarFilledSVG from '@app/../custom_cds_icon_svgs/star-filled.svg';
import TelegramLogoSVG from '@app/../custom_cds_icon_svgs/telegram.svg';
import TumblrLogoSVG from '@app/../custom_cds_icon_svgs/tumblr.svg';
import TwitterLogoSVG from '@app/../custom_cds_icon_svgs/twitter.svg';
import WhatsAppLogoSVG from '@app/../custom_cds_icon_svgs/whatsapp.svg';
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

export function clarityIconsFactory() {
  return () => {
    const myCollectionIcons: IconShapeTuple[] = [
      ['app-logo', AppLogoSVG],
      ['brand-facebook', FacebookLogoSVG],
      ['brand-google', GoogleLogoSVG],
      ['brand-twitter', TwitterLogoSVG],
      ['brand-linkedin', LinkedInLogoSVG],
      ['brand-pinterest', PinterestLogoSVG],
      ['brand-reddit', RedditLogoSVG],
      ['brand-tumblr', TumblrLogoSVG],
      ['brand-telegram', TelegramLogoSVG],
      ['brand-facebook-messenger', FacebookMessengerLogoSVG],
      ['brand-whatsapp', WhatsAppLogoSVG],
      ['book-strikethrough', BookStrikethroughSVG],
      ['star-filled', StarFilledSVG],
    ];
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
      ...myCollectionIcons,
    );
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
    {
      provide: APP_INITIALIZER,
      useFactory: clarityIconsFactory,
      multi: true,
    },
    CookieService,
    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      multi: true,
      deps: [ConfigService],
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
