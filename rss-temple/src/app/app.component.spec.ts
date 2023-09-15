import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule } from '@clr/angular';

import { AppAlertsComponent } from '@app/components/app-alerts/app-alerts.component';
import { NavComponent } from '@app/components/nav/nav.component';
import { ConfirmModalComponent } from '@app/components/shared/confirm-modal/confirm-modal.component';
import { SubNavComponent } from '@app/components/subnav/subnav.component';
import { ConfigService } from '@app/services';
import { MockConfigService } from '@app/test/config.service.mock';

import { AppComponent } from './app.component';

async function setup() {
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      HttpClientModule,
      ClarityModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [
      AppComponent,
      AppAlertsComponent,
      NavComponent,
      SubNavComponent,
      ConfirmModalComponent,
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
