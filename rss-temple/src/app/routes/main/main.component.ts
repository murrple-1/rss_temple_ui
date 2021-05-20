import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import {
  OnboardingModalComponent,
  openModal as openOnboardingModal,
} from '@app/routes/main/components/onboarding-modal/onboarding-modal.component';
import { UserService } from '@app/services/data';
import { ModalOpenService, SessionService } from '@app/services';
import { User } from '@app/models';

type UserImpl = Required<Pick<User, 'attributes'>>;

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
    private userService: UserService,
    private sessionService: SessionService,
    private modalOpenService: ModalOpenService,
  ) {}

  ngOnInit() {
    this.sessionService.isLoggedIn$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: isLoggedIn => {
          if (isLoggedIn) {
            this.userService
              .get({
                fields: ['attributes'],
              })
              .pipe(
                takeUntil(this.unsubscribe$),
                map(response => response as UserImpl),
              )
              .subscribe({
                next: user => {
                  const attributes = user.attributes;

                  if (attributes.onboarded !== true) {
                    this.zone.run(async () => {
                      if (this.onboardingModal !== undefined) {
                        this.modalOpenService.isModalOpen$.next(true);
                        await openOnboardingModal(this.onboardingModal);
                        this.modalOpenService.isModalOpen$.next(false);

                        this.userService
                          .updateAttributes({
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
