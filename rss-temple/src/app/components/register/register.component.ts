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
import { ActivatedRoute, Router } from '@angular/router';
import { ClrLoadingState } from '@clr/angular';
import { Subject, forkJoin } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';

import {
  InfoModalComponent,
  openModal as openInfoModal,
} from '@app/components/shared/info-modal/info-modal.component';
import {
  MinLength as PasswordMinLength,
  SpecialCharacters as PasswordSpecialCharacters,
  passwordRequirementsTextHtml,
} from '@app/libs/password.lib';
import { AppAlertsService } from '@app/services';
import {
  CaptchaService,
  RegistrationService,
  SocialService,
} from '@app/services/data';

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

  private googleToken: string | null = null;
  private facebookToken: string | null = null;

  private captchaKey: string | null = null;

  readonly ClrLoadingState = ClrLoadingState;
  registerButtonState = ClrLoadingState.DEFAULT;

  @ViewChild('registerForm', { static: true })
  registerForm?: NgForm;

  @ViewChild(InfoModalComponent, { static: true })
  infoModalComponent?: InfoModalComponent;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
    private registrationService: RegistrationService,
    private captchaService: CaptchaService,
    private socialService: SocialService,
    private appAlertsService: AppAlertsService,
  ) {}

  ngOnInit() {
    this.googleToken = this.route.snapshot.paramMap.get('g_token');
    this.facebookToken = this.route.snapshot.paramMap.get('fb_token');
    this.email = this.route.snapshot.paramMap.get('email') ?? '';

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

    if (this.googleToken !== null) {
      this.socialService
        .googleLogin(this.googleToken)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: this.handleRegisterSuccess.bind(this),
          error: this.handleRegisterError.bind(this),
        });
    } else if (this.facebookToken !== null) {
      this.socialService
        .facebookLogin(this.facebookToken)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: this.handleRegisterSuccess.bind(this),
          error: this.handleRegisterError.bind(this),
        });
    } else {
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
  }

  private async handleRegisterSuccess() {
    const infoModalComponent = this.infoModalComponent;
    if (infoModalComponent === undefined) {
      throw new Error('infoModalComponent undefined');
    }

    await openInfoModal(
      'Registration Started',
      'You will receive an email at the address you specified with a confirmation link. You will be unable to login until the link has been followed.',
      'info',
      infoModalComponent,
    );
    this.router.navigate(['/login']);
  }

  private handleRegisterError(error: any) {
    let errorMessage = 'Unknown Error';
    switch (error.status) {
      case 0:
        errorMessage = 'Unable to connect to server';
        break;
      case 409:
        errorMessage = 'Email already in use';
        break;
      case 404:
      case 422:
        errorMessage = 'Captcha failed';
        this.refreshCaptcha();
        this.zone.run(() => {
          this.captchaSecretPhrase = '';
        });
        break;
    }

    this.appAlertsService.appAlertDescriptor$.next({
      autoCloseInterval: 5000,
      canClose: true,
      text: errorMessage,
      type: 'danger',
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
