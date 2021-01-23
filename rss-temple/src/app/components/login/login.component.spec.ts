import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { of, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { MockActivatedRoute } from '@app/test/activatedroute.mock';
import { MockGAuthService } from '@app/test/gauth.service.mock';
import { MockFBAuthService } from '@app/test/fbauth.service.mock';
import {
  GAuthService,
  FBAuthService,
  LoginService,
  AppAlertsService,
} from '@app/services';
import { PasswordResetTokenService } from '@app/services/data';
import {
  openModal as openRequestPasswordResetModal,
  RequestPasswordResetModalComponent,
} from '@app/components/login/request-password-reset-modal/request-password-reset-modal.component';
import { AppAlertDescriptor } from '@app/services/app-alerts.service';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';

import { LoginComponent } from './login.component';

@Component({})
class MockComponent {}

async function setup() {
  const mockRoute = new MockActivatedRoute();

  const mockLoginService = jasmine.createSpyObj<LoginService>('LoginService', [
    'getMyLoginSession',
    'getGoogleLoginSession',
    'getFacebookLoginSession',
  ]);
  const mockPasswordResetTokenService = jasmine.createSpyObj<PasswordResetTokenService>(
    'PasswordResetTokenService',
    ['request'],
  );

  await TestBed.configureTestingModule({
    imports: [
      BrowserAnimationsModule,
      FormsModule,

      ClarityModule,

      RouterTestingModule.withRoutes([
        {
          path: 'main',
          component: MockComponent,
        },
        {
          path: 'register',
          component: MockComponent,
        },
      ]),
    ],
    declarations: [
      LoginComponent,
      MockComponent,
      RequestPasswordResetModalComponent,
      EmailValidatorDirective,
    ],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: mockRoute,
      },
      {
        provide: GAuthService,
        useClass: MockGAuthService,
      },
      {
        provide: FBAuthService,
        useClass: MockFBAuthService,
      },
      {
        provide: LoginService,
        useValue: mockLoginService,
      },
      {
        provide: PasswordResetTokenService,
        useValue: mockPasswordResetTokenService,
      },
    ],
  }).compileComponents();

  return {
    mockRoute,

    mockLoginService,
    mockPasswordResetTokenService,
  };
}

describe('LoginComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(LoginComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'should create component with returnUrl',
    waitForAsync(async () => {
      const { mockRoute } = await setup();

      const returnUrl = 'http://test.com';
      mockRoute.snapshot._paramMap._map.set('returnUrl', returnUrl);

      const componentFixture = TestBed.createComponent(LoginComponent);
      const component = componentFixture.componentInstance;

      component.ngOnInit();
      await componentFixture.whenStable();

      expect(component.returnUrl).toBe(returnUrl);
    }),
  );

  it(
    'can run ngOnInit',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(LoginComponent);
      const component = componentFixture.componentInstance;

      component.ngOnInit();
      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  it(
    'should handle Google login',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getGoogleLoginSession.and.returnValue(of('atoken'));

      const componentFixture = TestBed.createComponent(LoginComponent);
      const component = componentFixture.componentInstance;

      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const gAuthService = TestBed.inject(GAuthService);
      gAuthService.signIn();
      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  it(
    'should handle Facebook login',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getFacebookLoginSession.and.returnValue(of('atoken'));

      const componentFixture = TestBed.createComponent(LoginComponent);
      const component = componentFixture.componentInstance;

      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const fbAuthService = TestBed.inject(FBAuthService);
      fbAuthService.signIn();
      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  it(
    'should logout Google if already logged in',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(LoginComponent);
      const component = componentFixture.componentInstance;

      const gAuthService = TestBed.inject(GAuthService);
      gAuthService.signIn();

      component.ngOnInit();

      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  it(
    'should logout Facebook if already logged in',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(LoginComponent);
      const component = componentFixture.componentInstance;

      const fbAuthService = TestBed.inject(FBAuthService);
      fbAuthService.signIn();

      component.ngOnInit();

      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  it(
    'should handle missing email',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = '';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(By.css('input[type="password"]'))
        .nativeElement as HTMLInputElement;
      passwordInput.value = 'password';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const loginButton = debugElement.query(By.css('button[type="submit"]'))
        .nativeElement as HTMLButtonElement;
      loginButton.click();
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      expect(component._loginForm?.controls['email']?.errors ?? {}).toEqual(
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

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'bademail';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(By.css('input[type="password"]'))
        .nativeElement as HTMLInputElement;
      passwordInput.value = 'password';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const loginButton = debugElement.query(By.css('button[type="submit"]'))
        .nativeElement as HTMLButtonElement;
      loginButton.click();
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      expect(component._loginForm?.controls['email']?.errors ?? {}).toEqual(
        jasmine.objectContaining({
          invalidemail: jasmine.anything(),
        }),
      );
    }),
  );

  it(
    'should handle missing password',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(By.css('input[type="password"]'))
        .nativeElement as HTMLInputElement;
      passwordInput.value = '';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const loginButton = debugElement.query(By.css('button[type="submit"]'))
        .nativeElement as HTMLButtonElement;
      loginButton.click();
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      expect(component._loginForm?.controls['password']?.errors ?? {}).toEqual(
        jasmine.objectContaining({
          required: jasmine.anything(),
        }),
      );
    }),
  );

  it(
    'should be able to log in',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getMyLoginSession.and.returnValue(of('atoken'));

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(By.css('input[type="password"]'))
        .nativeElement as HTMLInputElement;
      passwordInput.value = 'password';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const loginButton = debugElement.query(By.css('button[type="submit"]'))
        .nativeElement as HTMLButtonElement;
      loginButton.click();
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      expect(mockLoginService.getMyLoginSession).toHaveBeenCalledWith(
        'test@test.com',
        'password',
      );
    }),
  );

  it(
    'should be able to login with Google',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getGoogleLoginSession.and.returnValue(of('atoken'));

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const gAuthService = debugElement.injector.get(
        GAuthService,
      ) as MockGAuthService;

      const googleButton = debugElement.query(By.css('button#google-login'))
        .nativeElement as HTMLButtonElement;
      googleButton.click();
      await componentFixture.whenStable();

      expect(gAuthService.user).toBeTruthy();
    }),
  );

  it(
    'should be able to login with Facebook',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getFacebookLoginSession.and.returnValue(of('atoken'));

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const fbAuthService = debugElement.injector.get(
        FBAuthService,
      ) as MockFBAuthService;

      const facebookButton = debugElement.query(By.css('button#facebook-login'))
        .nativeElement as HTMLButtonElement;
      facebookButton.click();
      await componentFixture.whenStable();

      expect(fbAuthService.user).toBeTruthy();
    }),
  );

  it(
    'should be possible to forget your password',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const clickSpy = spyOn(component, 'onForgottenPassword');

      const debugElement = componentFixture.debugElement;

      const forgotPasswordButton = debugElement.query(
        By.css('button#forgotten-password'),
      ).nativeElement as HTMLAnchorElement;
      forgotPasswordButton.click();
      await componentFixture.whenStable();

      expect(clickSpy).toHaveBeenCalled();
    }),
  );

  it(
    'should handle Google logout',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const gAuthService = debugElement.injector.get(
        GAuthService,
      ) as MockGAuthService;

      gAuthService.user$.next(null);
      await componentFixture.whenStable();

      expect(mockLoginService.getGoogleLoginSession).not.toHaveBeenCalled();
    }),
  );

  it(
    'should handle Facebook logout',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const fbAuthService = debugElement.injector.get(
        FBAuthService,
      ) as MockFBAuthService;

      fbAuthService.user$.next(null);
      await componentFixture.whenStable();

      expect(mockLoginService.getFacebookLoginSession).not.toHaveBeenCalled();
    }),
  );

  it(
    'should handle login errors: cannot connect',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getMyLoginSession.and.returnValue(
        new Observable<string>(subscriber => {
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

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(By.css('input[type="password"]'))
        .nativeElement as HTMLInputElement;
      passwordInput.value = 'password';
      passwordInput.dispatchEvent(new Event('input'));
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
    'should handle login errors: bad credentials',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getMyLoginSession.and.returnValue(
        new Observable<string>(subscriber => {
          subscriber.error(
            new HttpErrorResponse({
              status: 403,
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

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(By.css('input[type="password"]'))
        .nativeElement as HTMLInputElement;
      passwordInput.value = 'password';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const loginButton = debugElement.query(By.css('button[type="submit"]'))
        .nativeElement as HTMLButtonElement;
      loginButton.click();
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      await expectAsync(appAlertEmitPromise).toBeResolvedTo(
        jasmine.objectContaining({
          text: jasmine.stringMatching(/Email or password wrong/),
        }),
      );
    }),
  );

  it(
    'should handle login errors: unknown error',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getMyLoginSession.and.returnValue(
        new Observable<string>(subscriber => {
          subscriber.error(new Error('unknown error'));
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

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const emailInput = debugElement.query(By.css('input[type="email"]'))
        .nativeElement as HTMLInputElement;
      emailInput.value = 'test@test.com';
      emailInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const passwordInput = debugElement.query(By.css('input[type="password"]'))
        .nativeElement as HTMLInputElement;
      passwordInput.value = 'password';
      passwordInput.dispatchEvent(new Event('input'));
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const loginButton = debugElement.query(By.css('button[type="submit"]'))
        .nativeElement as HTMLButtonElement;
      loginButton.click();
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      await expectAsync(appAlertEmitPromise).toBeResolvedTo(
        jasmine.objectContaining({
          text: jasmine.stringMatching(/Unknown Error/),
        }),
      );
    }),
  );

  it(
    'should handle Google login errors: cannot connect',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getGoogleLoginSession.and.returnValue(
        new Observable<string>(subscriber => {
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

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const googleButton = debugElement.query(By.css('button#google-login'))
        .nativeElement as HTMLButtonElement;
      googleButton.click();
      await componentFixture.whenStable();

      await expectAsync(appAlertEmitPromise).toBeResolvedTo(
        jasmine.objectContaining({
          text: jasmine.stringMatching(/Unable to connect to server/),
        }),
      );
    }),
  );

  it(
    'should handle Google login errors: new credentials',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getGoogleLoginSession.and.returnValue(
        new Observable<string>(subscriber => {
          subscriber.error(
            new HttpErrorResponse({
              status: 422,
              error: {
                token: 'atoken',
                email: 'test@test.com',
              },
            }),
          );
        }),
      );
      spyOn(console, 'error');

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const googleButton = debugElement.query(By.css('button#google-login'))
        .nativeElement as HTMLButtonElement;
      googleButton.click();
      await componentFixture.whenStable();

      expect(router.navigate).toHaveBeenCalledWith(
        jasmine.objectContaining([
          jasmine.stringMatching(/register/),
          jasmine.any(Object),
        ]),
      );
    }),
  );

  it(
    'should handle Google login errors: unknown error',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getGoogleLoginSession.and.returnValue(
        new Observable<string>(subscriber => {
          subscriber.error(new Error('unknown error'));
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

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const googleButton = debugElement.query(By.css('button#google-login'))
        .nativeElement as HTMLButtonElement;
      googleButton.click();
      await componentFixture.whenStable();

      await expectAsync(appAlertEmitPromise).toBeResolvedTo(
        jasmine.objectContaining({
          text: jasmine.stringMatching(/Unknown Error/),
        }),
      );
    }),
  );

  it(
    'should handle Facebook login errors: cannot connect',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getFacebookLoginSession.and.returnValue(
        new Observable<string>(subscriber => {
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

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const facebookButton = debugElement.query(By.css('button#facebook-login'))
        .nativeElement as HTMLButtonElement;
      facebookButton.click();
      await componentFixture.whenStable();

      await expectAsync(appAlertEmitPromise).toBeResolvedTo(
        jasmine.objectContaining({
          text: jasmine.stringMatching(/Unable to connect to server/),
        }),
      );
    }),
  );

  it(
    'should handle Facebook login errors: new credentials',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getFacebookLoginSession.and.returnValue(
        new Observable<string>(subscriber => {
          subscriber.error(
            new HttpErrorResponse({
              status: 422,
              error: {
                token: 'atoken',
                email: 'test@test.com',
              },
            }),
          );
        }),
      );
      spyOn(console, 'error');

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const router = debugElement.injector.get(Router);
      spyOn(router, 'navigate');

      const facebookButton = debugElement.query(By.css('button#facebook-login'))
        .nativeElement as HTMLButtonElement;
      facebookButton.click();
      await componentFixture.whenStable();

      expect(router.navigate).toHaveBeenCalledWith(
        jasmine.objectContaining([
          jasmine.stringMatching(/register/),
          jasmine.any(Object),
        ]),
      );
    }),
  );

  it(
    'should handle Facebook login errors: unknown error',
    waitForAsync(async () => {
      const { mockLoginService } = await setup();
      mockLoginService.getFacebookLoginSession.and.returnValue(
        new Observable<string>(subscriber => {
          subscriber.error(new Error('unknown error'));
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

      const componentFixture = TestBed.createComponent(LoginComponent);
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;
      component.ngOnInit();

      const debugElement = componentFixture.debugElement;

      const facebookButton = debugElement.query(By.css('button#facebook-login'))
        .nativeElement as HTMLButtonElement;
      facebookButton.click();
      await componentFixture.whenStable();

      await expectAsync(appAlertEmitPromise).toBeResolvedTo(
        jasmine.objectContaining({
          text: jasmine.stringMatching(/Unknown Error/),
        }),
      );
    }),
  );
});
