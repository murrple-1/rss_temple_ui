import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';

import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { AuthService } from '@app/services/data';

import { ResetPasswordComponent } from './reset-password.component';

async function setup() {
  const mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', [
    'resetPassword',
  ]);

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterModule.forRoot([]),
    ],
    declarations: [ResetPasswordComponent, PasswordsMatchValidatorDirective],
    providers: [
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

describe('ResetPasswordComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(ResetPasswordComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
