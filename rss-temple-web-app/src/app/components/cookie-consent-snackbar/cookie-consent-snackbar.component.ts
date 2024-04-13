import { Component, EventEmitter, Output } from '@angular/core';

import { ConfigService } from '@app/services';

@Component({
  selector: 'app-cookie-consent-snackbar',
  templateUrl: './cookie-consent-snackbar.component.html',
  styleUrls: ['./cookie-consent-snackbar.component.scss'],
})
export class CookieConsentSnackbarComponent {
  privacyPolicyUrl: string | null;

  @Output()
  cookieConsentAcknowledged = new EventEmitter<void>();

  constructor(configService: ConfigService) {
    const privacyPolicyUrl = configService.get('privacyPolicyUrl');
    this.privacyPolicyUrl =
      typeof privacyPolicyUrl === 'string' ? privacyPolicyUrl : null;
  }

  onAcknowledge() {
    this.cookieConsentAcknowledged.emit();
  }
}
