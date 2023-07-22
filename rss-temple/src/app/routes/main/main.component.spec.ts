import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { OnboardingModalComponent } from '@app/routes/main/components/onboarding-modal/onboarding-modal.component';
import { AuthService } from '@app/services/data';
import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';

import { MainComponent } from './main.component';

async function setup() {
  const mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', [
    'getUser',
  ]);

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
    ],
  }).compileComponents();

  return {
    mockAuthService,
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
