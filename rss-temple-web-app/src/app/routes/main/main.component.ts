import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  OnboardingModalComponent,
  openModal as openOnboardingModal,
} from '@app/routes/main/components/onboarding-modal/onboarding-modal.component';
import { AuthStateService, ModalOpenService } from '@app/services';
import { AuthService } from '@app/services/data';

@Component({
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  @ViewChild(OnboardingModalComponent, { static: true })
  private onboardingModal?: OnboardingModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private authService: AuthService,
    private authStateService: AuthStateService,
    private modalOpenService: ModalOpenService,
  ) {}

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
