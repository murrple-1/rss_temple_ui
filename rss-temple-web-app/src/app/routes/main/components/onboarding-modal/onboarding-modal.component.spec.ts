import { TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';

import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';
import { ConfigService } from '@app/services';
import { MockConfigService } from '@app/test/config.service.mock';

import { OnboardingModalComponent } from './onboarding-modal.component';

async function setup() {
  const mockConfigService = new MockConfigService({
    apiHost: '',
    onboardingYoutubeEmbededUrl: '',
  });

  await TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule, ClarityModule],
    declarations: [OnboardingModalComponent, LocalAlertsComponent],
    providers: [
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

describe('OnboardingModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(OnboardingModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));
});
