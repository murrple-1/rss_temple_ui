import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { ClarityModule } from '@clr/angular';
import '@cds/core/icon/register.js';
import {
  ClarityIcons,
  exclamationCircleIcon,
  windowCloseIcon,
  exclamationTriangleIcon,
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
} from '@cds/core/icon';
import { IconShapeTuple } from '@cds/core/icon/interfaces/icon.interfaces';

import { AppSharedModule } from '@app/app-shared.module';

import { routes } from '@app/app.routing';

import { ConfigService } from '@app/services';

import { AppComponent } from '@app/app.component';
import { NavComponent } from '@app/components/nav/nav.component';
import { SubNavComponent } from '@app/components/subnav/subnav.component';
import { AppAlertsComponent } from '@app/components/app-alerts/app-alerts.component';
import { LoginComponent } from '@app/components/login/login.component';
import { RequestPasswordResetModalComponent as LoginRequestPasswordResetModalComponent } from '@app/components/login/request-password-reset-modal/request-password-reset-modal.component';
import { RegisterComponent } from '@app/components/register/register.component';
import { ResetPasswordComponent } from '@app/components/reset-password/reset-password.component';
import { VerifyComponent } from '@app/components/verify/verify.component';

const AppLogoSVG: string =
  require('!!raw-loader!../assets/images/icon.svg').default;
const FacebookLogoSVG: string =
  require('!!raw-loader!../assets/images/facebook-f.svg').default;
const GoogleLogoSVG: string =
  require('!!raw-loader!../assets/images/google.svg').default;

export function clarityIconsFactory() {
  return () => {
    const myCollectionIcons: IconShapeTuple[] = [
      ['app-logo', AppLogoSVG],
      ['brand-facebook', FacebookLogoSVG],
      ['brand-google', GoogleLogoSVG],
    ];
    ClarityIcons.addIcons(
      exclamationCircleIcon,
      windowCloseIcon,
      exclamationTriangleIcon,
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
      ...myCollectionIcons,
    );
  };
}

export function configFactory(configService: ConfigService) {
  return () => {
    return configService.load();
  };
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,

    ClarityModule,

    AppSharedModule,

    RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' }),
  ],
  declarations: [
    AppComponent,
    NavComponent,
    SubNavComponent,
    AppAlertsComponent,
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    LoginRequestPasswordResetModalComponent,
    VerifyComponent,
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: clarityIconsFactory,
      multi: true,
    },

    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      multi: true,
      deps: [ConfigService],
    },
  ],
})
export class AppModule {}
