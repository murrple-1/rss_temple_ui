import { TestBed, async } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { SnackbarModule } from 'ngx-snackbar';

import { PasswordResetTokenService } from '@app/services/data';

import { ResetPasswordComponent } from './resetpassword.component';

async function setup() {
  const mockPasswordResetTokenService = jasmine.createSpyObj<
    PasswordResetTokenService
  >('PasswordResetTokenService', ['reset']);

  await TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,

      SnackbarModule.forRoot(),

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
  it('should create the component', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(ResetPasswordComponent);
    const component = componentFixture.debugElement
      .componentInstance as ResetPasswordComponent;
    expect(component).toBeTruthy();
  }));

  // TODO more tests
});
