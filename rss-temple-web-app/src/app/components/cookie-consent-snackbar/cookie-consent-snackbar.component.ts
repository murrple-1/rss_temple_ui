import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-cookie-consent-snackbar',
  templateUrl: './cookie-consent-snackbar.component.html',
  styleUrls: ['./cookie-consent-snackbar.component.scss'],
})
export class CookieConsentSnackbarComponent {
  @Output()
  cookieConsentAcknowledged = new EventEmitter<void>();

  onAcknowledge() {
    this.cookieConsentAcknowledged.emit();
  }
}
