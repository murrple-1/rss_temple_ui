import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';

import { ThemeService } from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
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
