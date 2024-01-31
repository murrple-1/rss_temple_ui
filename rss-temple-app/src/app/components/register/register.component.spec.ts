import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule } from '@clr/angular';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { InfoModalComponent } from '@app/components/shared/info-modal/info-modal.component';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';
import { PasswordValidatorDirective } from '@app/directives/password-validator.directive';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { AppAlertsService } from '@app/services';
import { AppAlertDescriptor } from '@app/services/app-alerts.service';
import { CaptchaService, RegistrationService } from '@app/services/data';
import { MockActivatedRoute } from '@app/test/activatedroute.mock';

import { RegisterComponent } from './register.component';

const imageBlob = new Blob(
  [require('!!raw-loader!test_files/sample.png').default],
  {
    type: 'image/png',
  },
);
const audioBlob = new Blob(
  [require('!!raw-loader!test_files/sample.wav').default],
  {
    type: 'audio/wav',
  },
);

@Component({})
class MockComponent {}

async function setup() {
  const mockRoute = new MockActivatedRoute();

  const mockCaptchService = jasmine.createSpyObj<CaptchaService>(
    'CaptchaService',
    ['getKey', 'getImage', 'getAudio'],
  );
  mockCaptchService.getKey.and.returnValue(of('key'));
  mockCaptchService.getImage.and.returnValue(of(imageBlob));
  mockCaptchService.getAudio.and.returnValue(of(audioBlob));
  const mockRegistrationService = jasmine.createSpyObj<RegistrationService>(
    'RegistrationService',
    ['register'],
  );

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,

      ClarityModule,

      RouterTestingModule.withRoutes([
        {
          path: 'login',
          component: MockComponent,
        },
      ]),
    ],
    declarations: [
      RegisterComponent,
      EmailValidatorDirective,
      PasswordValidatorDirective,
      PasswordsMatchValidatorDirective,
      InfoModalComponent,
    ],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: mockRoute,
      },
      {
        provide: CaptchaService,
        useValue: mockCaptchService,
      },
      {
        provide: RegistrationService,
        useValue: mockRegistrationService,
      },
    ],
  }).compileComponents();

  return {
    mockRoute,

    mockCaptchService,
    mockRegistrationService,
  };
}

describe('RegisterComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(RegisterComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  it('should handle missing email', waitForAsync(async () => {
    await setup();

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
      jasmine.objectContaining({
        required: jasmine.anything(),
      }),
    );
  }));

  it('should handle malformed email', waitForAsync(async () => {
    await setup();

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
      jasmine.objectContaining({
        invalidemail: jasmine.anything(),
      }),
    );
  }));

  it('should handle mismatched passwords', waitForAsync(async () => {
    await setup();

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
      jasmine.objectContaining({
        passwordsdonotmatch: jasmine.anything(),
      }),
    );
  }));

  it('should handle missing password', waitForAsync(async () => {
    await setup();

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
      jasmine.objectContaining({
        required: jasmine.anything(),
      }),
    );
    expect(
      component.registerForm?.controls['passwordCheck']?.errors ?? {},
    ).toEqual(
      jasmine.objectContaining({
        required: jasmine.anything(),
      }),
    );
  }));

  it('should handle malformed password', waitForAsync(async () => {
    await setup();

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
        jasmine.objectContaining({
          [errorKey]: jasmine.anything(),
        }),
      );
    };

    await runMalformedPasswordTest('Ab1!', 'minlength');
    await runMalformedPasswordTest('PASSWORD1!', 'nolowercase');
    await runMalformedPasswordTest('password1!', 'nouppercase');
    await runMalformedPasswordTest('Password!', 'nodigit');
    await runMalformedPasswordTest('Password1', 'nospecialcharacter');
  }));

  it('should register', waitForAsync(async () => {
    const { mockRegistrationService } = await setup();
    mockRegistrationService.register.and.returnValue(of(undefined));

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

    expect(
      componentFixture.componentInstance.infoModalComponent?.open,
    ).toBeTrue();
  }));

  it('should handle registration errors: cannot connect', waitForAsync(async () => {
    const { mockRegistrationService } = await setup();
    mockRegistrationService.register.and.returnValue(
      throwError(
        new HttpErrorResponse({
          status: 0,
        }),
      ),
    );
    spyOn(console, 'error');
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

    await expectAsync(appAlertEmitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        text: jasmine.stringMatching(/Unable to connect to server/),
      }),
    );
  }));

  it('should handle registration errors: email already in use', waitForAsync(async () => {
    const { mockRegistrationService } = await setup();
    mockRegistrationService.register.and.returnValue(
      throwError(
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

    await expectAsync(appAlertEmitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        text: jasmine.stringMatching(/Email already in use/),
      }),
    );
  }));
});
