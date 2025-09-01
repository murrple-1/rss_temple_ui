import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  ClrIconModule,
  ClrMainContainerModule,
  ClrNavigationModule,
} from '@clr/angular';
import { CookieService } from 'ngx-cookie-service';

import { ThemeService } from '@app/services';

import { AppAlertsComponent } from './components/app-alerts/app-alerts.component';
import { CookieConsentSnackbarComponent } from './components/cookie-consent-snackbar/cookie-consent-snackbar.component';
import { NavComponent } from './components/nav/nav.component';
import { SubNavComponent } from './components/subnav/subnav.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    ClrMainContainerModule,
    ClrNavigationModule,
    AppAlertsComponent,
    RouterLink,
    ClrIconModule,
    NavComponent,
    SubNavComponent,
    RouterOutlet,
    CookieConsentSnackbarComponent,
  ],
})
export class AppComponent implements OnInit {
  private title = inject(Title);
  private cookieService = inject(CookieService);
  private themeService = inject(ThemeService);

  shouldShowCookieConsent = false;

  ngOnInit() {
    this.title.setTitle('RSS Temple');

    this.shouldShowCookieConsent = !this.cookieService.check('cookieconsent');

    this.themeService.init();
  }

  onCookieConsentAckowledged() {
    this.cookieService.set('cookieconsent', 'true', {
      path: '/',
      expires: 365,
    });
    this.shouldShowCookieConsent = false;
  }
}
