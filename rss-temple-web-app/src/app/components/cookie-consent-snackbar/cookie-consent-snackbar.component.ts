import { Component, EventEmitter, Output, inject } from '@angular/core';

import { ConfigService } from '@app/services';

@Component({
  selector: 'app-cookie-consent-snackbar',
  templateUrl: './cookie-consent-snackbar.component.html',
  styleUrls: ['./cookie-consent-snackbar.component.scss'],
  standalone: false,
})
export class CookieConsentSnackbarComponent {
  privacyPolicyUrl: string | null;

  @Output()
  cookieConsentAcknowledged = new EventEmitter<void>();

  constructor() {
    const configService = inject(ConfigService);

    const privacyPolicyUrl = configService.get('privacyPolicyUrl');
    this.privacyPolicyUrl =
      typeof privacyPolicyUrl === 'string' ? privacyPolicyUrl : null;
  }

  onAcknowledge() {
    this.cookieConsentAcknowledged.emit();
  }
}
