import { APP_BASE_HREF } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';

import { AppAlertsComponent } from '@app/components/app-alerts/app-alerts.component';
import { NavComponent } from '@app/components/nav/nav.component';
import { SearchModalComponent } from '@app/components/nav/search-modal/search-modal.component';
import { ConfirmModalComponent } from '@app/components/shared/confirm-modal/confirm-modal.component';
import { SubNavComponent } from '@app/components/subnav/subnav.component';
import { ConfigService } from '@app/services';
import { MockConfigService } from '@app/test/config.service.mock';

import { AppComponent } from './app.component';
import { CookieConsentSnackbarComponent } from './components/cookie-consent-snackbar/cookie-consent-snackbar.component';

async function setup() {
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  await TestBed.configureTestingModule({
    declarations: [
      AppComponent,
      AppAlertsComponent,
      NavComponent,
      SubNavComponent,
      ConfirmModalComponent,
      SearchModalComponent,
      CookieConsentSnackbarComponent,
    ],
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterModule.forRoot([]),
    ],
    providers: [
      {
        provide: APP_BASE_HREF,
        useValue: '/',
      },
      {
        provide: ConfigService,
        useValue: mockConfigService,
      },
      provideHttpClient(withInterceptorsFromDi()),
    ],
  }).compileComponents();

  return {
    mockConfigService,
  };
}

describe('AppComponent', () => {
  it('should create the app', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(AppComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));
});
