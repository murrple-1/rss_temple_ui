import { APP_BASE_HREF } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule } from '@clr/angular';

import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';
import { OnboardingModalComponent } from '@app/routes/main/components/onboarding-modal/onboarding-modal.component';
import { ConfigService } from '@app/services';
import { AuthService } from '@app/services/data';
import { MockConfigService } from '@app/test/config.service.mock';

import { MainComponent } from './main.component';

async function setup() {
  const mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', [
    'getUser',
  ]);
  const mockConfigService = new MockConfigService({
    apiHost: '',
    onboardingYoutubeEmbededUrl: '',
  });

  await TestBed.configureTestingModule({
    imports: [
      BrowserAnimationsModule,
      ClarityModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [
      MainComponent,
      OnboardingModalComponent,
      LocalAlertsComponent,
    ],
    providers: [
      {
        provide: APP_BASE_HREF,
        useValue: '/',
      },

      {
        provide: AuthService,
        useValue: mockAuthService,
      },
      {
        provide: ConfigService,
        useValue: mockConfigService,
      },
    ],
  }).compileComponents();

  return {
    mockAuthService,
    mockConfigService,
  };
}

describe('MainComponent', () => {
  it('should create the app', async () => {
    await setup();

    const componentFixture = TestBed.createComponent(MainComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
  });

  // TODO more tests
});
