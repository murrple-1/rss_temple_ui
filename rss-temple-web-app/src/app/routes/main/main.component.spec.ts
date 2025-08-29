import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';

import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';
import { OnboardingModalComponent } from '@app/routes/main/components/onboarding-modal/onboarding-modal.component';
import { ConfigService } from '@app/services';
import { AuthService } from '@app/services/data';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  beforeEach(async () => {
    const mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUser',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ClarityModule,
        RouterModule.forRoot([]),
      ],
      declarations: [
        MainComponent,
        OnboardingModalComponent,
        LocalAlertsComponent,
      ],
      providers: [
        provideHttpClient(),
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },

        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
            onboardingYoutubeEmbededUrl: '',
          },
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', async () => {
    const componentFixture = TestBed.createComponent(MainComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
  });

  // TODO more tests
});
