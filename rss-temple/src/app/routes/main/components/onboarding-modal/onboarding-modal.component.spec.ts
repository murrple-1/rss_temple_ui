import { TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { OnboardingModalComponent } from './onboarding-modal.component';

async function setup() {
  await TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule, ClarityModule],
    declarations: [OnboardingModalComponent],
  }).compileComponents();

  return {};
}

describe('OnboardingModalComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(
        OnboardingModalComponent,
      );
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );
});
