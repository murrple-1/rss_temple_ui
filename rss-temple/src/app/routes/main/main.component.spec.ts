import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { OnboardingModalComponent } from '@app/routes/main/components/onboarding-modal/onboarding-modal.component';
import { UserService } from '@app/services/data';

import { MainComponent } from './main.component';

async function setup() {
  const mockUserService = jasmine.createSpyObj<UserService>('UserService', [
    'get',
  ]);

  await TestBed.configureTestingModule({
    imports: [
      BrowserAnimationsModule,
      ClarityModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [MainComponent, OnboardingModalComponent],
    providers: [
      {
        provide: APP_BASE_HREF,
        useValue: '/',
      },

      {
        provide: UserService,
        useValue: mockUserService,
      },
    ],
  }).compileComponents();

  return {
    mockUserService,
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
