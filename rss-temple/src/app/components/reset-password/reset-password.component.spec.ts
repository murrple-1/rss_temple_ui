import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { PasswordResetTokenService } from '@app/services/data';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';

import { ResetPasswordComponent } from './reset-password.component';

async function setup() {
  const mockPasswordResetTokenService =
    jasmine.createSpyObj<PasswordResetTokenService>(
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
    declarations: [ResetPasswordComponent, PasswordsMatchValidatorDirective],
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
      componentFixture.detectChanges();
      await componentFixture.whenStable();
    }),
  );

  // TODO more tests
});
