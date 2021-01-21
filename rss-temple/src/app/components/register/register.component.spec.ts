import { TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { AlertService, LoginService } from '@app/services';
import { passwordRequirementsText } from '@app/libs/password.lib';
import { MockActivatedRoute } from '@app/test/activatedroute.mock';

import { RegisterComponent, State } from './register.component';

@Component({})
class MockComponent {}

async function setup() {
  const mockRoute = new MockActivatedRoute();

  const mockLoginService = jasmine.createSpyObj<LoginService>('LoginService', [
    'createMyLogin',
    'createGoogleLogin',
    'createFacebookLogin',
  ]);
  const mockAlertService = jasmine.createSpyObj<AlertService>('AlertService', [
    'error',
  ]);

  await TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,

      RouterTestingModule.withRoutes([
        {
          path: 'login',
          component: MockComponent,
        },
      ]),
    ],
    declarations: [RegisterComponent],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: mockRoute,
      },
      {
        provide: LoginService,
        useValue: mockLoginService,
      },
      {
        provide: AlertService,
        useValue: mockAlertService,
      },
    ],
  }).compileComponents();

  return {
    mockRoute,

    mockLoginService,
    mockAlertService,
  };
}

describe('RegisterComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
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
      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;

      component.ngOnInit();
      await componentFixture.whenStable();

      expect(component.registerForm.controls['email'].value).toBe(email);
    }),
  );

  it(
    'can run ngOnInit',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;

      component.ngOnInit();
      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  it(
    'should handle missing email',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = '';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(
        By.css('input[type="password"][formControlName="password"]'),
      ).nativeElement as HTMLInputElement;
      passwordInput.value = 'Password1!';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordCheckInput = debugElement.query(
        By.css('input[type="password"][formControlName="passwordCheck"]'),
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

      expect(component.registerFormErrors.controls['email']).toContain(
        'Email required',
      );
    }),
  );

  it(
    'should handle malformed email',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'bademail';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(
        By.css('input[type="password"][formControlName="password"]'),
      ).nativeElement as HTMLInputElement;
      passwordInput.value = 'Password1!';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordCheckInput = debugElement.query(
        By.css('input[type="password"][formControlName="passwordCheck"]'),
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

      expect(component.registerFormErrors.controls['email']).toContain(
        'Email malformed',
      );
    }),
  );

  it(
    'should handle mismatched passwords',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(
        By.css('input[type="password"][formControlName="password"]'),
      ).nativeElement as HTMLInputElement;
      passwordInput.value = 'Password1!';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordCheckInput = debugElement.query(
        By.css('input[type="password"][formControlName="passwordCheck"]'),
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

      expect(component.registerFormErrors.errors).toContain(
        'Passwords do not match',
      );
    }),
  );

  it(
    'should handle missing password',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(
        By.css('input[type="password"][formControlName="password"]'),
      ).nativeElement as HTMLInputElement;
      passwordInput.value = '';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordCheckInput = debugElement.query(
        By.css('input[type="password"][formControlName="passwordCheck"]'),
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

      expect(component.registerFormErrors.controls['password']).toContain(
        'Password required',
      );
    }),
  );

  it(
    'should handle malformed password',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(
        By.css('input[type="password"][formControlName="password"]'),
      ).nativeElement as HTMLInputElement;
      const passwordCheckInput = debugElement.query(
        By.css('input[type="password"][formControlName="passwordCheck"]'),
      ).nativeElement as HTMLInputElement;
      const loginButton = debugElement.query(By.css('button[type="submit"]'))
        .nativeElement as HTMLButtonElement;

      const runMalformedPasswordTest = async (passwordText: string) => {
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

        expect(component.registerFormErrors.controls['password']).toContain(
          passwordRequirementsText('en'),
        );
      };

      await runMalformedPasswordTest('Ab1!');
      await runMalformedPasswordTest('PASSWORD1!');
      await runMalformedPasswordTest('password1!');
      await runMalformedPasswordTest('Password!');
      await runMalformedPasswordTest('Password1');
    }),
  );

  it(
    'should register: my',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
      component.ngOnInit();

      mockLoginService.createMyLogin.and.returnValue(of(undefined));

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(
        By.css('input[type="password"][formControlName="password"]'),
      ).nativeElement as HTMLInputElement;
      passwordInput.value = 'Password1!';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordCheckInput = debugElement.query(
        By.css('input[type="password"][formControlName="passwordCheck"]'),
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

      const componentFixture = TestBed.createComponent(RegisterComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
      component.ngOnInit();

      mockLoginService.createGoogleLogin.and.returnValue(of(undefined));
      (component as any).googleToken = 'google-token';

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(
        By.css('input[type="password"][formControlName="password"]'),
      ).nativeElement as HTMLInputElement;
      passwordInput.value = 'Password1!';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordCheckInput = debugElement.query(
        By.css('input[type="password"][formControlName="passwordCheck"]'),
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

      const componentFixture = TestBed.createComponent(RegisterComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
      component.ngOnInit();

      mockLoginService.createFacebookLogin.and.returnValue(of(undefined));
      (component as any).facebookToken = 'facebook-token';

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(
        By.css('input[type="password"][formControlName="password"]'),
      ).nativeElement as HTMLInputElement;
      passwordInput.value = 'Password1!';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordCheckInput = debugElement.query(
        By.css('input[type="password"][formControlName="passwordCheck"]'),
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
      const { mockLoginService, mockAlertService } = await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
      component.ngOnInit();

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

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(
        By.css('input[type="password"][formControlName="password"]'),
      ).nativeElement as HTMLInputElement;
      passwordInput.value = 'Password1!';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordCheckInput = debugElement.query(
        By.css('input[type="password"][formControlName="passwordCheck"]'),
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

      expect(mockAlertService.error).toHaveBeenCalledWith(
        jasmine.stringMatching(/Unable to connect to server/),
        jasmine.any(Number),
      );
      expect(component.state).toBe(State.RegisterFailed);
    }),
  );

  it(
    'should handle registration errors: email already in use',
    waitForAsync(async () => {
      const { mockLoginService, mockAlertService } = await setup();

      const componentFixture = TestBed.createComponent(RegisterComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.debugElement
        .componentInstance as RegisterComponent;
      component.ngOnInit();

      mockLoginService.createMyLogin.and.returnValue(
        new Observable<void>(subscriber => {
          subscriber.error(
            new HttpErrorResponse({
              status: 409,
            }),
          );
        }),
      );

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(
        By.css('input[type="password"][formControlName="password"]'),
      ).nativeElement as HTMLInputElement;
      passwordInput.value = 'Password1!';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordCheckInput = debugElement.query(
        By.css('input[type="password"][formControlName="passwordCheck"]'),
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

      expect(mockAlertService.error).toHaveBeenCalledWith(
        jasmine.stringMatching(/Email already in use/),
        jasmine.any(Number),
      );
      expect(component.state).toBe(State.RegisterFailed);
    }),
  );
});
