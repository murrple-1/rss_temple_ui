import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  OnboardingModalComponent,
  openModal as openOnboardingModal,
} from '@app/routes/main/components/onboarding-modal/onboarding-modal.component';
import { AuthService } from '@app/services/data';
import { ModalOpenService, AuthTokenService } from '@app/services';

@Component({
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  @ViewChild(OnboardingModalComponent)
  private onboardingModal?: OnboardingModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private authService: AuthService,
    private authTokenService: AuthTokenService,
    private modalOpenService: ModalOpenService,
  ) {}

  ngOnInit() {
    this.authTokenService.isLoggedIn$
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
                      if (this.onboardingModal !== undefined) {
                        this.modalOpenService.isModalOpen$.next(true);
                        await openOnboardingModal(this.onboardingModal);
                        this.modalOpenService.isModalOpen$.next(false);

                        this.authService
                          .updateUserAttributes({
                            onboarded: true,
                          })
                          .pipe(takeUntil(this.unsubscribe$))
                          .subscribe();
                      }
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
