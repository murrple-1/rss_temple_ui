import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  OnboardingModalComponent,
  openModal as openOnboardingModal,
} from '@app/routes/main/components/onboarding-modal/onboarding-modal.component';
import { AuthStateService, ModalOpenService } from '@app/services';
import { AuthService } from '@app/services/data';

import { OnboardingModalComponent as OnboardingModalComponent_1 } from './components/onboarding-modal/onboarding-modal.component';

@Component({
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [RouterOutlet, OnboardingModalComponent_1],
})
export class MainComponent implements OnInit, OnDestroy {
  private zone = inject(NgZone);
  private authService = inject(AuthService);
  private authStateService = inject(AuthStateService);
  private modalOpenService = inject(ModalOpenService);

  @ViewChild(OnboardingModalComponent, { static: true })
  private onboardingModal?: OnboardingModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

  ngOnInit() {
    this.authStateService.isLoggedIn$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: isLoggedIn => {
          if (isLoggedIn) {
            this.authService
              .getUser()
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe({
                next: user => {
                  const attributes = user.attributes;

                  if (attributes.onboarded !== true) {
                    this.zone.run(async () => {
                      const onboardingModal = this.onboardingModal;
                      if (onboardingModal === undefined) {
                        throw new Error();
                      }
                      this.modalOpenService.openModal(async () => {
                        await openOnboardingModal(onboardingModal);
                        this.authService
                          .updateUserAttributes({
                            onboarded: true,
                          })
                          .pipe(takeUntil(this.unsubscribe$))
                          .subscribe();
                      });
                    });
                  }
                },
              });
          }
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
