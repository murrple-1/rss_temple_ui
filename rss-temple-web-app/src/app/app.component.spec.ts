import { APP_BASE_HREF } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppAlertsComponent } from '@app/components/app-alerts/app-alerts.component';
import { NavComponent } from '@app/components/nav/nav.component';
import { SearchModalComponent } from '@app/components/nav/search-modal/search-modal.component';
import { ConfirmModalComponent } from '@app/components/shared/confirm-modal/confirm-modal.component';
import { SubNavComponent } from '@app/components/subnav/subnav.component';
import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { AppComponent } from './app.component';
import { CookieConsentSnackbarComponent } from './components/cookie-consent-snackbar/cookie-consent-snackbar.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserModule,
        ClarityModule,
        RouterModule.forRoot([]),
        AppAlertsComponent,
        NavComponent,
        SubNavComponent,
        ConfirmModalComponent,
        SearchModalComponent,
        CookieConsentSnackbarComponent,
        AppComponent,
      ],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
          },
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
  });

  it('should create the app', async () => {
    const componentFixture = TestBed.createComponent(AppComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });
});
