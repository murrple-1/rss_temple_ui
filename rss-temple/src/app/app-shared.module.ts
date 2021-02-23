import { NgModule } from '@angular/core';

import { PasswordValidatorDirective } from '@app/directives/password-validator.directive';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';

@NgModule({
  declarations: [
    PasswordValidatorDirective,
    PasswordsMatchValidatorDirective,
    EmailValidatorDirective,
  ],
  exports: [
    PasswordValidatorDirective,
    PasswordsMatchValidatorDirective,
    EmailValidatorDirective,
  ],
})
export class AppSharedModule {}
