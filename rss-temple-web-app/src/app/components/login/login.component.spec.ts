import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { RequestPasswordResetModalComponent } from '@app/components/login/request-password-reset-modal/request-password-reset-modal.component';
import { LocalAlertsComponent } from '@app/components/shared/local-alerts/local-alerts.component';
import { AppAlertsService, FBAuthService, GAuthService } from '@app/services';
import { ConfigService } from '@app/services';
import { AppAlertDescriptor } from '@app/services/app-alerts.service';
import { AuthService, SocialService } from '@app/services/data';
import { MockActivatedRoute } from '@app/test/activatedroute.mock';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';
import { MockFBAuthService } from '@app/test/fbauth.service.mock';
import { MockGAuthService } from '@app/test/gauth.service.mock';

import { LoginComponent } from './login.component';

@Component({ imports: [FormsModule, ClarityModule] })
class MockComponent {}

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ClarityModule,
        RouterModule.forRoot([
          {
            path: 'main',
            component: MockComponent,
          },
          {
            path: 'register',
            component: MockComponent,
          },
        ]),
        LoginComponent,
        MockComponent,
        RequestPasswordResetModalComponent,
        LocalAlertsComponent,
      ],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useClass: MockActivatedRoute,
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj<AuthService>('AuthService', ['login']),
        },
        {
          provide: SocialService,
          useValue: jasmine.createSpyObj<SocialService>('SocialService', [
            'googleLogin',
            'facebookLogin',
          ]),
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
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
            googleClientId: '',
            facebookAppId: '',
          },
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  it('should create component with returnUrl', waitForAsync(async () => {
    const mockRoute = TestBed.inject(ActivatedRoute) as MockActivatedRoute;

    const returnUrl = 'http://test.com';
    mockRoute.snapshot._paramMap._map.set('returnUrl', returnUrl);

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(component._returnUrl).toBe(returnUrl);
  }));

  it('should handle Google login', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.googleLogin.and.returnValue(
      of({
        key: 'atoken',
        csrfToken: 'csrfToken',
      }),
    );
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const gAuthService = TestBed.inject(GAuthService);
    gAuthService.signIn();
    expect().nothing();
  }));

  it('should handle Facebook login', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.facebookLogin.and.returnValue(
      of({
        key: 'atoken',
        csrfToken: 'csrfToken',
      }),
    );
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const fbAuthService = TestBed.inject(FBAuthService);
    fbAuthService.signIn();
    await componentFixture.whenStable();
    expect().nothing();
  }));

  it('should logout Google if already logged in', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;

    const gAuthService = TestBed.inject(GAuthService);
    gAuthService.signIn();

    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect().nothing();
  }));

  it('should logout Facebook if already logged in', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;

    const fbAuthService = TestBed.inject(FBAuthService);
    fbAuthService.signIn();

    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect().nothing();
  }));

  it('should handle missing email', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

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

    expect(component.loginForm?.controls['email']?.errors ?? {}).toEqual(
      jasmine.objectContaining({
        required: jasmine.anything(),
      }),
    );
  }));

  it('should handle missing password', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(LoginComponent);
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

    expect(component.loginForm?.controls['password']?.errors ?? {}).toEqual(
      jasmine.objectContaining({
        required: jasmine.anything(),
      }),
    );
  }));

  it('should be able to log in', waitForAsync(async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as jasmine.SpyObj<AuthService>;
    mockAuthService.login.and.returnValue(
      of({
        key: 'b75a903f398823a74e5f8e7ec231705bac3c6161',
      }),
    );
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

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

    expect(mockAuthService.login).toHaveBeenCalledWith(
      'test@test.com',
      'password',
      false,
    );
  }));

  it('should be able to login with Google', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.googleLogin.and.returnValue(
      of({
        key: 'atoken',
        csrfToken: 'csrfToken',
      }),
    );
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    const gAuthService = TestBed.inject(GAuthService) as MockGAuthService;

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const googleButton = debugElement.query(By.css('button#google-login'))
      .nativeElement as HTMLButtonElement;
    googleButton.click();
    await componentFixture.whenStable();

    expect(gAuthService.user).toBeTruthy();
  }));

  it('should be able to login with Facebook', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.facebookLogin.and.returnValue(
      of({
        key: 'atoken',
        csrfToken: 'csrfToken',
      }),
    );
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    const fbAuthService = TestBed.inject(FBAuthService) as MockFBAuthService;

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const facebookButton = debugElement.query(By.css('button#facebook-login'))
      .nativeElement as HTMLButtonElement;
    facebookButton.click();
    await componentFixture.whenStable();

    expect(fbAuthService.user).toBeTruthy();
  }));

  it('should be possible to forget your password', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const clickSpy = spyOn(component, 'onForgottenPassword');

    const forgotPasswordButton = debugElement.query(
      By.css('button#forgotten-password'),
    ).nativeElement as HTMLAnchorElement;
    forgotPasswordButton.click();
    await componentFixture.whenStable();

    expect(clickSpy).toHaveBeenCalled();
  }));

  it('should handle Google logout', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    const gAuthService = TestBed.inject(GAuthService) as MockGAuthService;

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    gAuthService.user$.next(null);
    await componentFixture.whenStable();

    expect(mockSocialService.googleLogin).not.toHaveBeenCalled();
  }));

  it('should handle Facebook logout', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    const fbAuthService = TestBed.inject(FBAuthService) as MockFBAuthService;

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    fbAuthService.user$.next(null);
    await componentFixture.whenStable();

    expect(mockSocialService.facebookLogin).not.toHaveBeenCalled();
  }));

  it('should handle login errors: cannot connect', waitForAsync(async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as jasmine.SpyObj<AuthService>;
    mockAuthService.login.and.returnValue(
      throwError(
        () =>
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

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
  }));

  it('should handle login errors: bad credentials', waitForAsync(async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as jasmine.SpyObj<AuthService>;
    mockAuthService.login.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
          }),
      ),
    );
    spyOn(console, 'error');

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

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

    const alertElement = debugElement.query(By.css('.alert-text'))
      .nativeElement as HTMLSpanElement;
    expect(alertElement.innerText).toEqual(
      jasmine.stringMatching(/(?:email.*?password|password.*?email).*?wrong/i),
    );
  }));

  it('should handle login errors: unknown error', waitForAsync(async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as jasmine.SpyObj<AuthService>;
    mockAuthService.login.and.returnValue(
      throwError(() => new Error('unknown error')),
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
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

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
  }));

  it('should handle Google login errors: cannot connect', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.googleLogin.and.returnValue(
      throwError(
        () =>
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const googleButton = debugElement.query(By.css('button#google-login'))
      .nativeElement as HTMLButtonElement;
    googleButton.click();
    await componentFixture.whenStable();

    await expectAsync(appAlertEmitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        text: jasmine.stringMatching(/Unable to connect to server/),
      }),
    );
  }));

  it('should handle Google login errors: new credentials', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.googleLogin.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            error: {},
          }),
      ),
    );

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const googleButton = debugElement.query(By.css('button#google-login'))
      .nativeElement as HTMLButtonElement;
    googleButton.click();
    await componentFixture.whenStable();
  }));

  it('should handle Google login errors: unknown error', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.googleLogin.and.returnValue(
      throwError(() => new Error('unknown error')),
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
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const googleButton = debugElement.query(By.css('button#google-login'))
      .nativeElement as HTMLButtonElement;
    googleButton.click();
    await componentFixture.whenStable();

    await expectAsync(appAlertEmitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        text: jasmine.stringMatching(/Unknown Error/),
      }),
    );
  }));

  it('should handle Facebook login errors: cannot connect', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.facebookLogin.and.returnValue(
      throwError(
        () =>
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const facebookButton = debugElement.query(By.css('button#facebook-login'))
      .nativeElement as HTMLButtonElement;
    facebookButton.click();
    await componentFixture.whenStable();

    await expectAsync(appAlertEmitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        text: jasmine.stringMatching(/Unable to connect to server/),
      }),
    );
  }));

  it('should handle Facebook login errors: new credentials', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.facebookLogin.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            error: {},
          }),
      ),
    );

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const facebookButton = debugElement.query(By.css('button#facebook-login'))
      .nativeElement as HTMLButtonElement;
    facebookButton.click();
    await componentFixture.whenStable();
  }));

  it('should handle Facebook login errors: unknown error', waitForAsync(async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.facebookLogin.and.returnValue(
      throwError(() => new Error('unknown error')),
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
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const facebookButton = debugElement.query(By.css('button#facebook-login'))
      .nativeElement as HTMLButtonElement;
    facebookButton.click();
    await componentFixture.whenStable();

    await expectAsync(appAlertEmitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        text: jasmine.stringMatching(/Unknown Error/),
      }),
    );
  }));
});
