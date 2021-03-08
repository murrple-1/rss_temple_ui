import { NgModule } from '@angular/core';

import { PasswordValidatorDirective } from '@app/directives/password-validator.directive';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';

import { DateFormatPipe } from '@app/pipes/dayjs-format.pipe';

@NgModule({
  declarations: [
    PasswordValidatorDirective,
    PasswordsMatchValidatorDirective,
    EmailValidatorDirective,

    DateFormatPipe,
  ],
  exports: [
    PasswordValidatorDirective,
    PasswordsMatchValidatorDirective,
    EmailValidatorDirective,

    DateFormatPipe,
  ],
})
export class AppSharedModule {}
