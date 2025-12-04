import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import pngBase64 from 'test_files/sample.png.base64.json';
import wavBase64 from 'test_files/sample.wav.base64.json';
import {
  type MockedObject,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { InfoModalComponent } from '@app/components/shared/info-modal/info-modal.component';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';
import { PasswordValidatorDirective } from '@app/directives/password-validator.directive';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { AppAlertsService } from '@app/services';
import { AppAlertDescriptor } from '@app/services/app-alerts.service';
import { CaptchaService, RegistrationService } from '@app/services/data';
import { MockActivatedRoute } from '@app/test/activatedroute.mock';

import { RegisterComponent } from './register.component';

@Component({ template: '' })
class MockComponent {}

describe('RegisterComponent', () => {
  let imageBlob: Blob | null = null;
  let audioBlob: Blob | null = null;

  beforeAll(async () => {
    const [imageResponse, audioResponse] = await Promise.all([
      fetch(`data:image/png;base64,${pngBase64 as string}`),
      fetch(`data:audio/wav;base64,${wavBase64 as string}`),
    ]);
    if (!imageResponse.ok) {
      throw new Error(`imageResponse: ${imageResponse.statusText}`);
    }
    if (!audioResponse.ok) {
      throw new Error(`audioResponse: ${audioResponse.statusText}`);
    }

    imageBlob = await imageResponse.blob();
    audioBlob = await audioResponse.blob();
  });

  beforeEach(async () => {
    if (imageBlob === null) {
      throw new Error('Image blob not loaded');
    }
    if (audioBlob === null) {
      throw new Error('Audio blob not loaded');
    }

    const mockCaptchService = {
      getKey: vi.fn().mockName('CaptchaService.getKey'),
      getImage: vi.fn().mockName('CaptchaService.getImage'),
      getAudio: vi.fn().mockName('CaptchaService.getAudio'),
    };
    mockCaptchService.getKey.mockReturnValue(of('key'));
    mockCaptchService.getImage.mockReturnValue(of(imageBlob));
    mockCaptchService.getAudio.mockReturnValue(of(audioBlob));

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        RouterModule.forRoot([
          {
            path: 'login',
            component: MockComponent,
          },
        ]),
        RegisterComponent,
        EmailValidatorDirective,
        PasswordValidatorDirective,
        PasswordsMatchValidatorDirective,
        InfoModalComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useClass: MockActivatedRoute,
        },
        {
          provide: CaptchaService,
          useValue: mockCaptchService,
        },
        {
          provide: RegistrationService,
          useValue: {
            register: vi.fn().mockName('RegistrationService.register'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(RegisterComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  it('should handle missing email', async () => {
    const componentFixture = TestBed.createComponent(RegisterComponent);
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = '';
    emailInput.dispatchEvent(new Event('input'));
    await componentFixture.whenStable();

    const passwordInput = debugElement.query(
      By.css('input[type="password"][name="password"]'),
    ).nativeElement as HTMLInputElement;
    passwordInput.value = 'Password1!';
    passwordInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordCheckInput = debugElement.query(
      By.css('input[type="password"][name="passwordCheck"]'),
    ).nativeElement as HTMLInputElement;
    passwordCheckInput.value = 'Password1!';
    passwordCheckInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const loginButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    loginButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(component.registerForm?.controls['email']?.errors ?? {}).toEqual(
      expect.objectContaining({
        required: expect.anything(),
      }),
    );
  });

  it('should handle malformed email', async () => {
    const componentFixture = TestBed.createComponent(RegisterComponent);
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(
      By.css('input[type="email"][name="email"]'),
    ).nativeElement as HTMLInputElement;
    emailInput.value = 'bademail';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordInput = debugElement.query(
      By.css('input[type="password"][name="password"]'),
    ).nativeElement as HTMLInputElement;
    passwordInput.value = 'Password1!';
    passwordInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordCheckInput = debugElement.query(
      By.css('input[type="password"][name="passwordCheck"]'),
    ).nativeElement as HTMLInputElement;
    passwordCheckInput.value = 'Password1!';
    passwordCheckInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const loginButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    loginButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(component.registerForm?.controls['email']?.errors).toEqual(
      expect.objectContaining({
        invalidemail: expect.anything(),
      }),
    );
  });

  it('should handle mismatched passwords', async () => {
    const componentFixture = TestBed.createComponent(RegisterComponent);
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordInput = debugElement.query(
      By.css('input[type="password"][name="password"]'),
    ).nativeElement as HTMLInputElement;
    passwordInput.value = 'Password1!';
    passwordInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordCheckInput = debugElement.query(
      By.css('input[type="password"][name="passwordCheck"]'),
    ).nativeElement as HTMLInputElement;
    passwordCheckInput.value = 'Password2!';
    passwordCheckInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const loginButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    loginButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(component.registerForm?.errors ?? {}).toEqual(
      expect.objectContaining({
        passwordsdonotmatch: expect.anything(),
      }),
    );
  });

  it('should handle missing password', async () => {
    const componentFixture = TestBed.createComponent(RegisterComponent);
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordInput = debugElement.query(
      By.css('input[type="password"][name="password"]'),
    ).nativeElement as HTMLInputElement;
    passwordInput.value = '';
    passwordInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordCheckInput = debugElement.query(
      By.css('input[type="password"][name="passwordCheck"]'),
    ).nativeElement as HTMLInputElement;
    passwordCheckInput.value = '';
    passwordCheckInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const loginButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    loginButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(component.registerForm?.controls['password']?.errors ?? {}).toEqual(
      expect.objectContaining({
        required: expect.anything(),
      }),
    );
    expect(
      component.registerForm?.controls['passwordCheck']?.errors ?? {},
    ).toEqual(
      expect.objectContaining({
        required: expect.anything(),
      }),
    );
  });

  it('should handle malformed password', async () => {
    const componentFixture = TestBed.createComponent(RegisterComponent);
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordInput = debugElement.query(
      By.css('input[type="password"][name="password"]'),
    ).nativeElement as HTMLInputElement;
    const passwordCheckInput = debugElement.query(
      By.css('input[type="password"][name="passwordCheck"]'),
    ).nativeElement as HTMLInputElement;
    const loginButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;

    const runMalformedPasswordTest = async (
      passwordText: string,
      errorKey: string,
    ) => {
      passwordInput.value = passwordText;
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      passwordCheckInput.value = passwordText;
      passwordCheckInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      loginButton.click();
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      expect(
        component.registerForm?.controls['password']?.errors ?? {},
      ).toEqual(
        expect.objectContaining({
          [errorKey]: expect.anything(),
        }),
      );
    };

    await runMalformedPasswordTest('Ab1!', 'minlength');
    await runMalformedPasswordTest('PASSWORD1!', 'nolowercase');
    await runMalformedPasswordTest('password1!', 'nouppercase');
    await runMalformedPasswordTest('Password!', 'nodigit');
    await runMalformedPasswordTest('Password1', 'nospecialcharacter');
  });

  it('should register', async () => {
    const mockRegistrationService = TestBed.inject(
      RegistrationService,
    ) as MockedObject<RegistrationService>;
    mockRegistrationService.register.mockReturnValue(of(undefined));

    const componentFixture = TestBed.createComponent(RegisterComponent);
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordInput = debugElement.query(
      By.css('input[type="password"][name="password"]'),
    ).nativeElement as HTMLInputElement;
    passwordInput.value = 'Password1!';
    passwordInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordCheckInput = debugElement.query(
      By.css('input[type="password"][name="passwordCheck"]'),
    ).nativeElement as HTMLInputElement;
    passwordCheckInput.value = 'Password1!';
    passwordCheckInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const captchaSecretPhraseInput = debugElement.query(
      By.css('input[name="captchaSecretPhrase"]'),
    ).nativeElement as HTMLInputElement;
    captchaSecretPhraseInput.value = '123456';
    captchaSecretPhraseInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const loginButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    loginButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(componentFixture.componentInstance.infoModal?.open).toBe(true);
  });

  it('should handle registration errors: cannot connect', async () => {
    const mockRegistrationService = TestBed.inject(
      RegistrationService,
    ) as MockedObject<RegistrationService>;
    mockRegistrationService.register.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 0,
          }),
      ),
    );
    vi.spyOn(console, 'error');
    const appAlertService = TestBed.inject(AppAlertsService);
    const appAlertEmitPromise = new Promise<AppAlertDescriptor>(resolve => {
      appAlertService.appAlertDescriptor$.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    const componentFixture = TestBed.createComponent(RegisterComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordInput = debugElement.query(
      By.css('input[type="password"][name="password"]'),
    ).nativeElement as HTMLInputElement;
    passwordInput.value = 'Password1!';
    passwordInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordCheckInput = debugElement.query(
      By.css('input[type="password"][name="passwordCheck"]'),
    ).nativeElement as HTMLInputElement;
    passwordCheckInput.value = 'Password1!';
    passwordCheckInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const loginButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    loginButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    await expect(appAlertEmitPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.stringMatching(/Unable to connect to server/),
      }),
    );
  });

  it('should handle registration errors: email already in use', async () => {
    const mockRegistrationService = TestBed.inject(
      RegistrationService,
    ) as MockedObject<RegistrationService>;
    mockRegistrationService.register.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
          }),
      ),
    );
    const appAlertService = TestBed.inject(AppAlertsService);
    const appAlertEmitPromise = new Promise<AppAlertDescriptor>(resolve => {
      appAlertService.appAlertDescriptor$.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    const componentFixture = TestBed.createComponent(RegisterComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordInput = debugElement.query(
      By.css('input[type="password"][name="password"]'),
    ).nativeElement as HTMLInputElement;
    passwordInput.value = 'Password1!';
    passwordInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const passwordCheckInput = debugElement.query(
      By.css('input[type="password"][name="passwordCheck"]'),
    ).nativeElement as HTMLInputElement;
    passwordCheckInput.value = 'Password1!';
    passwordCheckInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const loginButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    loginButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    await expect(appAlertEmitPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.stringMatching(/Email already in use/),
      }),
    );
  });
});
