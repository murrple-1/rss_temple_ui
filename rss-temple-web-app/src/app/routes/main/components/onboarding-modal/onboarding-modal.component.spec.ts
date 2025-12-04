import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it } from 'vitest';

import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';
import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { OnboardingModalComponent } from './onboarding-modal.component';

describe('OnboardingModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        OnboardingModalComponent,
        LocalAlertsComponent,
      ],
      providers: [
        provideHttpClient(),
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

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(OnboardingModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });
});
