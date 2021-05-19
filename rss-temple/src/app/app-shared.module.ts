import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClarityModule } from '@clr/angular';

import { PasswordValidatorDirective } from '@app/directives/password-validator.directive';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';
import { VarDirective } from '@app/directives/var.directive';

import { DateFormatPipe } from '@app/pipes/dayjs-format.pipe';
import { SafeHtmlPipe } from '@app/pipes/safe-html.pipe';

import { ConfirmModalComponent } from '@app/components/shared/confirm-modal/confirm-modal.component';
import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';

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
