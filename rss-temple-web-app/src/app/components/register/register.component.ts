import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ClrAccordionModule,
  ClrAlertModule,
  ClrCommonFormsModule,
  ClrConditionalModule,
  ClrDatagridModule,
  ClrIconModule,
  ClrInputModule,
  ClrLoadingButtonModule,
  ClrLoadingModule,
  ClrLoadingState,
} from '@clr/angular';
import { Subject, forkJoin } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { z } from 'zod';

import {
  InfoModalComponent,
  openModal as openInfoModal,
} from '@app/components/shared/info-modal/info-modal.component';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';
import { PasswordValidatorDirective } from '@app/directives/password-validator.directive';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import {
  MinLength as PasswordMinLength,
  SpecialCharacters as PasswordSpecialCharacters,
  passwordRequirementsTextHtml,
} from '@app/libs/password.lib';
import { AppAlertsService, ModalOpenService } from '@app/services';
import { CaptchaService, RegistrationService } from '@app/services/data';

const Z422Error = z.record(z.string(), z.unknown());

@Component({
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    FormsModule,
    ClrCommonFormsModule,
    PasswordsMatchValidatorDirective,
    ClrInputModule,
    EmailValidatorDirective,
    PasswordValidatorDirective,
    ClrAccordionModule,
    ClrDatagridModule,
    ClrConditionalModule,
    ClrIconModule,
    ClrAlertModule,
    ClrLoadingButtonModule,
    ClrLoadingModule,
    RouterLink,
    InfoModalComponent,
  ],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private zone = inject(NgZone);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private registrationService = inject(RegistrationService);
  private captchaService = inject(CaptchaService);
  private appAlertsService = inject(AppAlertsService);
  private modalOpenService = inject(ModalOpenService);

  readonly passwordHelperTextHtml = passwordRequirementsTextHtml('en');
  readonly passwordMinLength = PasswordMinLength;
  readonly passwordSpecialCharacters = PasswordSpecialCharacters.join('');

  email = '';
  password = '';
  passwordCheck = '';
  captchaImageSrc: string | null = null;
  captchaAudio: HTMLAudioElement | null = null;
  captchaSecretPhrase = '';

  private captchaKey: string | null = null;

  readonly ClrLoadingState = ClrLoadingState;
  registerButtonState = ClrLoadingState.DEFAULT;

  @ViewChild('registerForm', { static: true })
  registerForm?: NgForm;

  @ViewChild(InfoModalComponent, { static: true })
  infoModal?: InfoModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

  ngOnInit() {
    this.loadCaptcha();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadCaptcha() {
    this.captchaService
      .getKey()
      .pipe(
        tap(key => {
          this.captchaKey = key;
        }),
        mergeMap(key =>
          forkJoin([
            this.captchaService.getImage(key),
            this.captchaService.getAudio(key),
          ]),
        ),
        takeUntil(this.unsubscribe$),
      )
      .subscribe({
        next: ([image, audio]) => {
          this.zone.run(() => {
            this.captchaImageSrc = URL.createObjectURL(image);
            this.captchaAudio = new Audio(URL.createObjectURL(audio));
            this.captchaAudio.onended = () => {
              this.changeDetectorRef.detectChanges();
            };
          });
        },
        error: error => {
          let errorHandled = false;
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 0: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Unable to connect to server',
                  type: 'danger',
                  key: 'unable-to-connect',
                });
                errorHandled = true;
                break;
              }
              case 429: {
                this.appAlertsService.appAlertDescriptor$.next({
                  autoCloseInterval: 5000,
                  canClose: true,
                  text: 'Request throttled: Please try again in a few minutes',
                  type: 'warning',
                  key: 'throttled',
                });
                errorHandled = true;
                break;
              }
            }
          }

          if (!errorHandled) {
            console.error('Unknown Error', error);
            this.appAlertsService.appAlertDescriptor$.next({
              autoCloseInterval: 5000,
              canClose: true,
              text: 'Unknown Error',
              type: 'danger',
              key: 'unknown-error',
            });
          }
        },
      });
  }

  onRegister() {
    if (this.registerForm === undefined) {
      throw new Error();
    }

    if (this.registerForm.invalid) {
      return;
    }

    this.registerButtonState = ClrLoadingState.LOADING;

    if (this.captchaKey === null) {
      throw new Error('captchaKey null');
    }

    this.registrationService
      .register(
        this.email,
        this.password,
        this.captchaKey,
        this.captchaSecretPhrase,
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: this.handleRegisterSuccess.bind(this),
        error: this.handleRegisterError.bind(this),
      });
  }

  private async handleRegisterSuccess() {
    const infoModalComponent = this.infoModal;
    if (infoModalComponent === undefined) {
      throw new Error('infoModalComponent undefined');
    }

    this.modalOpenService.openModal(async () => {
      await openInfoModal(
        'Registration Started',
        'You will receive an email at the address you specified with a confirmation link. You will be unable to login until the link has been followed.',
        'info',
        infoModalComponent,
      );
      this.router.navigate(['/login']);
    });
  }

  private handleRegisterError(error: unknown) {
    let errorMessage = 'Unknown Error';
    let key: string | null = 'unknown-error';
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0: {
          errorMessage = 'Unable to connect to server';
          key = 'unable-to-connect';
          break;
        }
        case 409: {
          errorMessage = 'Email already in use';
          key = null;
          break;
        }
        case 404: {
          errorMessage = 'Captcha failed';
          key = null;
          this.refreshCaptcha();
          this.zone.run(() => {
            this.captchaSecretPhrase = '';
          });
          break;
        }
        case 422: {
          const errorRecord = Z422Error.safeParse(error.error);
          if (errorRecord.success) {
            const keys = Object.keys(errorRecord.data);
            if (keys.includes('captchaSecretPhrase')) {
              errorMessage = 'Captcha failed';
              key = null;
              this.refreshCaptcha();
              this.zone.run(() => {
                this.captchaSecretPhrase = '';
              });
            } else if (keys.includes('password')) {
              errorMessage =
                'Password was determined to be too easy to guess based on internal analysis. Please try a different password';
              key = null;
            }
          }
          break;
        }
        case 429: {
          errorMessage = 'Request throttled: Please try again in a few minutes';
          key = 'throttled';
          break;
        }
      }
    }

    this.appAlertsService.appAlertDescriptor$.next({
      autoCloseInterval: 5000,
      canClose: true,
      text: errorMessage,
      type: 'danger',
      key,
    });

    this.zone.run(() => {
      this.registerButtonState = ClrLoadingState.DEFAULT;
    });
  }

  onCaptchaAudioPlay() {
    if (this.captchaAudio === null) {
      throw new Error('captchaAudio null');
    }

    this.captchaAudio.play();
  }

  onCaptchaAudioStop() {
    if (this.captchaAudio === null) {
      throw new Error('captchaAudio null');
    }

    this.captchaAudio.pause();
    this.captchaAudio.currentTime = 0;
  }

  refreshCaptcha() {
    if (this.captchaAudio !== null) {
      this.captchaAudio.pause();
      this.captchaAudio = null;
    }

    this.captchaImageSrc = null;
    this.captchaKey = null;

    this.loadCaptcha();
  }
}
