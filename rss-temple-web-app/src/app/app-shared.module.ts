import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';

import { ConfirmModalComponent } from '@app/components/shared/confirm-modal/confirm-modal.component';
import { InfoModalComponent } from '@app/components/shared/info-modal/info-modal.component';
import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';
import { PasswordValidatorDirective } from '@app/directives/password-validator.directive';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { UrlValidatorDirective } from '@app/directives/url-validator.directive';
import { DateFormatPipe } from '@app/pipes/dayjs-format.pipe';
import { SafeHtmlPipe } from '@app/pipes/safe-html.pipe';
import { TruncatedNumberPipe } from '@app/pipes/truncated-number.pipe';

@NgModule({
  imports: [
    CommonModule,
    ClarityModule,
    PasswordValidatorDirective,
    PasswordsMatchValidatorDirective,
    EmailValidatorDirective,
    UrlValidatorDirective,
    DateFormatPipe,
    SafeHtmlPipe,
    TruncatedNumberPipe,
    ConfirmModalComponent,
    InfoModalComponent,
    LocalAlertsComponent,
  ],
  exports: [
    PasswordValidatorDirective,
    PasswordsMatchValidatorDirective,
    EmailValidatorDirective,
    UrlValidatorDirective,
    DateFormatPipe,
    SafeHtmlPipe,
    TruncatedNumberPipe,
    ConfirmModalComponent,
    InfoModalComponent,
    LocalAlertsComponent,
  ],
})
export class AppSharedModule {}
