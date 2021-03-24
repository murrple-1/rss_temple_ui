import { NgModule } from '@angular/core';

import { PasswordValidatorDirective } from '@app/directives/password-validator.directive';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';
import { VarDirective } from '@app/directives/var.directive';

import { DateFormatPipe } from '@app/pipes/dayjs-format.pipe';

@NgModule({
  declarations: [
    PasswordValidatorDirective,
    PasswordsMatchValidatorDirective,
    EmailValidatorDirective,
    VarDirective,

    DateFormatPipe,
  ],
  exports: [
    PasswordValidatorDirective,
    PasswordsMatchValidatorDirective,
    EmailValidatorDirective,
    VarDirective,

    DateFormatPipe,
  ],
})
export class AppSharedModule {}
