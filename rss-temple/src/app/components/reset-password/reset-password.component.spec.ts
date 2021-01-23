import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { PasswordResetTokenService } from '@app/services/data';

import { ResetPasswordComponent } from './reset-password.component';

async function setup() {
  const mockPasswordResetTokenService = jasmine.createSpyObj<PasswordResetTokenService>(
    'PasswordResetTokenService',
    ['reset'],
  );

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [ResetPasswordComponent],
    providers: [
      {
        provide: PasswordResetTokenService,
        useValue: mockPasswordResetTokenService,
      },
    ],
  }).compileComponents();

  return {
    mockPasswordResetTokenService,
  };
}

describe('ResetPasswordComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(ResetPasswordComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'can run ngOnInit',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(ResetPasswordComponent);
      const component = componentFixture.componentInstance;

      component.ngOnInit();
      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  // TODO more tests
});
