import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';

import { ThemeService } from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  shouldShowCookieConsent = false;

  constructor(
    private title: Title,
    private cookieService: CookieService,
    private themeService: ThemeService,
  ) {}

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
