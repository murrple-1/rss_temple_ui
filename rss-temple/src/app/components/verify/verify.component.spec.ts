import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { RegistrationService } from '@app/services/data';

import { VerifyComponent } from './verify.component';

async function setup() {
  const mockRegistrationService = jasmine.createSpyObj<RegistrationService>(
    'RegistrationService',
    ['verifyEmail'],
  );

  await TestBed.configureTestingModule({
    imports: [RouterTestingModule.withRoutes([])],
    declarations: [VerifyComponent],
    providers: [
      {
        provide: RegistrationService,
        useValue: mockRegistrationService,
      },
    ],
  }).compileComponents();

  return {
    mockRegistrationService,
  };
}

describe('VerifyComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(VerifyComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
      componentFixture.detectChanges();
      await componentFixture.whenStable();
    }),
  );

  // TODO more tests
});
