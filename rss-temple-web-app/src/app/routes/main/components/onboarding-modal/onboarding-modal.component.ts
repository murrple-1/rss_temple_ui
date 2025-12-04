import { Component, OnDestroy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ClrModalModule } from '@clr/angular';
import { Subject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';
import { ConfigService } from '@app/services';

@Component({
  selector: 'app-onboarding-modal',
  templateUrl: './onboarding-modal.component.html',
  styleUrls: ['./onboarding-modal.component.scss'],
  imports: [ClrModalModule, LocalAlertsComponent],
})
export class OnboardingModalComponent implements OnDestroy {
  open = false;

  readonly iframeSrc: SafeResourceUrl;

  result = new Subject<void>();

  constructor() {
    const sanitizer = inject(DomSanitizer);
    const configService = inject(ConfigService);

    const youtubeSrc = configService.get<string>('onboardingYoutubeEmbededUrl');
    if (typeof youtubeSrc !== 'string') {
      throw new Error('onboardingYoutubeEmbededUrl malformed');
    }

    this.iframeSrc = sanitizer.bypassSecurityTrustResourceUrl(youtubeSrc);
  }

  ngOnDestroy() {
    this.result.complete();
  }

  reset() {
    // do nothing
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next();
    }

    this.open = open;
  }

  close() {
    this.result.next();

    this.open = false;
  }
}

export function openModal(modal: OnboardingModalComponent) {
  modal.reset();
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
