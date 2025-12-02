import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  enableProdMode,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withRouterConfig } from '@angular/router';
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
  hourglassIcon,
  libraryIcon,
  lightbulbIcon,
  linkIcon,
  logoutIcon,
  minusIcon,
  playIcon,
  plusIcon,
  refreshIcon,
  scrollIcon,
  searchIcon,
  shareIcon,
  starIcon,
  stopIcon,
  talkBubblesIcon,
  uploadIcon,
  warningStandardIcon,
  windowCloseIcon,
} from '@cds/core/icon';
import { ClarityModule } from '@clr/angular';
import { CookieService } from 'ngx-cookie-service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';

import { routes } from '@app/app.routing';
import { ConfigService } from '@app/services';

import { environment } from '@environments/environment';

import { AppComponent } from './app/app.component';

function clarityIconsFactory(http: HttpClient) {
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
      hourglassIcon,
      scrollIcon,
      warningStandardIcon,
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
        'brand-bluesky': http
          .get('/assets/custom_cds_icon_svgs/bluesky.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-threads': http
          .get('/assets/custom_cds_icon_svgs/threads.svg', {
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
        'brand-lemmy': http
          .get('/assets/custom_cds_icon_svgs/lemmy.svg', {
            responseType: 'text',
          })
          .pipe(catchError(() => of(null))),
        'brand-mastodon': http
          .get('/assets/custom_cds_icon_svgs/mastodon.svg', {
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
    const myCollectionIcons: [string, string][] = [];
    for (const [key, value] of Object.entries(myCollectionIconDownloads)) {
      if (value !== null) {
        myCollectionIcons.push([key, value]);
      }
    }
    ClarityIcons.addIcons(...myCollectionIcons);
  };
}

function configFactory(configService: ConfigService) {
  return () => configService.load();
}

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    importProvidersFrom(BrowserModule, FormsModule, ClarityModule),
    provideHttpClient(withInterceptorsFromDi()),
    provideAppInitializer(() => {
      const initializerFn = clarityIconsFactory(inject(HttpClient));
      return initializerFn();
    }),
    CookieService,
    provideAppInitializer(() => {
      const initializerFn = configFactory(inject(ConfigService));
      return initializerFn();
    }),
    provideAnimations(),
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
  ],
}).catch(err => console.error(err));
