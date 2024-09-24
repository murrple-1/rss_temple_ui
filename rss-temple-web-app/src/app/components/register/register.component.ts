import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ClrLoadingState } from '@clr/angular';
import { Subject, forkJoin } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { z } from 'zod';

import {
  InfoModalComponent,
  openModal as openInfoModal,
} from '@app/components/shared/info-modal/info-modal.component';
import {
  MinLength as PasswordMinLength,
  SpecialCharacters as PasswordSpecialCharacters,
  passwordRequirementsTextHtml,
} from '@app/libs/password.lib';
import { AppAlertsService, ModalOpenService } from '@app/services';
import { CaptchaService, RegistrationService } from '@app/services/data';

const Z422Error = z.record(z.unknown());

@Component({
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
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

  constructor(
    private router: Router,
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
    private registrationService: RegistrationService,
    private captchaService: CaptchaService,
    private appAlertsService: AppAlertsService,
    private modalOpenService: ModalOpenService,
  ) {}

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
