import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

import { AppAlertsService, LoginService } from '@app/services';
import { MockActivatedRoute } from '@app/test/activatedroute.mock';
import { AppAlertDescriptor } from '@app/services/app-alerts.service';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';
import { PasswordValidatorDirective } from '@app/directives/password-validator.directive';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';

import { RegisterComponent } from './register.component';

@Component({})
class MockComponent {}

async function setup() {
  const mockRoute = new MockActivatedRoute();

  const mockLoginService = jasmine.createSpyObj<LoginService>('LoginService', [
    'createMyLogin',
    'createGoogleLogin',
    'createFacebookLogin',
  ]);

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
    ],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: mockRoute,
      },
      {
        provide: LoginService,
        useValue: mockLoginService,
      },
    ],
  }).compileComponents();

  return {
    mockRoute,

    mockLoginService,
  };
}

describe('RegisterComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'should create component with email',
    waitForAsync(async () => {
      const { mockRoute } = await setup();

      const email = 'test@test.com';
      mockRoute.snapshot._paramMap._map.set('email', email);

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;

      component.ngOnInit();

      expect(component.email).toBe(email);
    }),
  );

  it(
    'can run ngOnInit',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;

      component.ngOnInit();

      expect().nothing();
    }),
  );

  it(
    'should handle missing email',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;
      const debugElement = componentFixture.debugElement;

      component.ngOnInit();
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
    }),
  );

  it(
    'should handle malformed email',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;
      const debugElement = componentFixture.debugElement;

      component.ngOnInit();
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
    }),
  );

  it(
    'should handle mismatched passwords',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;
      const debugElement = componentFixture.debugElement;

      component.ngOnInit();
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
    }),
  );

  it(
    'should handle missing password',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;
      const debugElement = componentFixture.debugElement;

      component.ngOnInit();
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

      expect(
        component.registerForm?.controls['password']?.errors ?? {},
      ).toEqual(
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
    }),
  );

  it(
    'should handle malformed password',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;
      const debugElement = componentFixture.debugElement;

      component.ngOnInit();
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
    }),
  );

  it(
    'should register: my',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.createMyLogin.and.returnValue(of(undefined));

      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;
      const debugElement = componentFixture.debugElement;

      component.ngOnInit();
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

      expect(router.navigate).toHaveBeenCalledWith(
        jasmine.objectContaining([jasmine.stringMatching(/login/)]),
      );
    }),
  );

  it(
    'should register: Google',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.createGoogleLogin.and.returnValue(of(undefined));
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;
      const debugElement = componentFixture.debugElement;

      component.ngOnInit();
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      (component as any).googleToken = 'google-token';

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

      expect(router.navigate).toHaveBeenCalledWith(
        jasmine.objectContaining([jasmine.stringMatching(/login/)]),
      );
    }),
  );

  it(
    'should register: Facebook',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.createFacebookLogin.and.returnValue(of(undefined));
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.componentInstance;
      const debugElement = componentFixture.debugElement;

      component.ngOnInit();
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      (component as any).facebookToken = 'facebook-token';

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

      expect(router.navigate).toHaveBeenCalledWith(
        jasmine.objectContaining([jasmine.stringMatching(/login/)]),
      );
    }),
  );

  it(
    'should handle registration errors: cannot connect',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.createMyLogin.and.returnValue(
        new Observable<void>(subscriber => {
          subscriber.error(
            new HttpErrorResponse({
              status: 0,
            }),
          );
        }),
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
      const component = componentFixture.componentInstance;
      const debugElement = componentFixture.debugElement;

      component.ngOnInit();
      component.ngOnInit();
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
    }),
  );

  it(
    'should handle registration errors: email already in use',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.createMyLogin.and.returnValue(
        new Observable<void>(subscriber => {
          subscriber.error(
            new HttpErrorResponse({
              status: 409,
            }),
          );
        }),
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
      const component = componentFixture.componentInstance;
      const debugElement = componentFixture.debugElement;

      component.ngOnInit();
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
    }),
  );
});
