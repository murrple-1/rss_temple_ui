import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';

import { ConfirmModalComponent } from '@app/components/shared/confirm-modal/confirm-modal.component';
import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';
import { PasswordValidatorDirective } from '@app/directives/password-validator.directive';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { VarDirective } from '@app/directives/var.directive';
import { DateFormatPipe } from '@app/pipes/dayjs-format.pipe';
import { SafeHtmlPipe } from '@app/pipes/safe-html.pipe';

@NgModule({
  imports: [CommonModule, ClarityModule],
  declarations: [
    PasswordValidatorDirective,
    PasswordsMatchValidatorDirective,
    EmailValidatorDirective,
    VarDirective,

    DateFormatPipe,
    SafeHtmlPipe,

    ConfirmModalComponent,
    LocalAlertsComponent,
  ],
  exports: [
    PasswordValidatorDirective,
    PasswordsMatchValidatorDirective,
    EmailValidatorDirective,
    VarDirective,

    DateFormatPipe,
    SafeHtmlPipe,

    ConfirmModalComponent,
    LocalAlertsComponent,
  ],
})
export class AppSharedModule {}
