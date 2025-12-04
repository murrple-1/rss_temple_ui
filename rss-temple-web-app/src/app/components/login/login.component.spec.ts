import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  type MockedObject,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

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

@Component({ imports: [FormsModule, ClarityModule], template: '' })
class MockComponent {}

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        // TODO should be replacable when Clarity v18\+ is released/used
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
          useValue: {
            login: vi.fn().mockName('AuthService.login'),
          },
        },
        {
          provide: SocialService,
          useValue: {
            googleLogin: vi.fn().mockName('SocialService.googleLogin'),
            facebookLogin: vi.fn().mockName('SocialService.facebookLogin'),
          },
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

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  it('should create component with returnUrl', async () => {
    const mockRoute = TestBed.inject(ActivatedRoute) as MockActivatedRoute;

    const returnUrl = 'http://test.com';
    mockRoute.snapshot._paramMap._map.set('returnUrl', returnUrl);

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(component._returnUrl).toBe(returnUrl);
  });

  it('should handle Google login', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.googleLogin.mockReturnValue(
      of({
        key: 'atoken',
        csrfToken: 'csrfToken',
      }),
    );
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const gAuthService = TestBed.inject(GAuthService);
    gAuthService.signIn();
  });

  it('should handle Facebook login', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.facebookLogin.mockReturnValue(
      of({
        key: 'atoken',
        csrfToken: 'csrfToken',
      }),
    );
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const fbAuthService = TestBed.inject(FBAuthService);
    fbAuthService.signIn();
    await componentFixture.whenStable();
  });

  it('should logout Google if already logged in', async () => {
    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;

    const gAuthService = TestBed.inject(GAuthService);
    gAuthService.signIn();

    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  it('should logout Facebook if already logged in', async () => {
    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;

    const fbAuthService = TestBed.inject(FBAuthService);
    fbAuthService.signIn();

    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  it('should handle missing email', async () => {
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
      expect.objectContaining({
        required: expect.anything(),
      }),
    );
  });

  it('should handle missing password', async () => {
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
      expect.objectContaining({
        required: expect.anything(),
      }),
    );
  });

  it('should be able to log in', async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as MockedObject<AuthService>;
    mockAuthService.login.mockReturnValue(
      of({
        key: 'b75a903f398823a74e5f8e7ec231705bac3c6161',
      }),
    );
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

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
  });

  it('should be able to login with Google', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.googleLogin.mockReturnValue(
      of({
        key: 'atoken',
        csrfToken: 'csrfToken',
      }),
    );
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
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
  });

  it('should be able to login with Facebook', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.facebookLogin.mockReturnValue(
      of({
        key: 'atoken',
        csrfToken: 'csrfToken',
      }),
    );
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
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
  });

  it('should be possible to forget your password', async () => {
    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const clickSpy = vi.spyOn(component, 'onForgottenPassword');

    const forgotPasswordButton = debugElement.query(
      By.css('button#forgotten-password'),
    ).nativeElement as HTMLAnchorElement;
    forgotPasswordButton.click();
    await componentFixture.whenStable();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should handle Google logout', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    const gAuthService = TestBed.inject(GAuthService) as MockGAuthService;

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    gAuthService.user$.next(null);
    await componentFixture.whenStable();

    expect(mockSocialService.googleLogin).not.toHaveBeenCalled();
  });

  it('should handle Facebook logout', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    const fbAuthService = TestBed.inject(FBAuthService) as MockFBAuthService;

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    fbAuthService.user$.next(null);
    await componentFixture.whenStable();

    expect(mockSocialService.facebookLogin).not.toHaveBeenCalled();
  });

  it('should handle login errors: cannot connect', async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as MockedObject<AuthService>;
    mockAuthService.login.mockReturnValue(
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

    await expect(appAlertEmitPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.stringMatching(/Unable to connect to server/),
      }),
    );
  });

  it('should handle login errors: bad credentials', async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as MockedObject<AuthService>;
    mockAuthService.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
          }),
      ),
    );
    vi.spyOn(console, 'error');

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
      expect.stringMatching(/(?:email.*?password|password.*?email).*?wrong/i),
    );
  });

  it('should handle login errors: unknown error', async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as MockedObject<AuthService>;
    mockAuthService.login.mockReturnValue(
      throwError(() => new Error('unknown error')),
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

    await expect(appAlertEmitPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.stringMatching(/Unknown Error/),
      }),
    );
  });

  it('should handle Google login errors: cannot connect', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.googleLogin.mockReturnValue(
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const googleButton = debugElement.query(By.css('button#google-login'))
      .nativeElement as HTMLButtonElement;
    googleButton.click();
    await componentFixture.whenStable();

    await expect(appAlertEmitPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.stringMatching(/Unable to connect to server/),
      }),
    );
  });

  it('should handle Google login errors: new credentials', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.googleLogin.mockReturnValue(
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
  });

  it('should handle Google login errors: unknown error', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.googleLogin.mockReturnValue(
      throwError(() => new Error('unknown error')),
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const googleButton = debugElement.query(By.css('button#google-login'))
      .nativeElement as HTMLButtonElement;
    googleButton.click();
    await componentFixture.whenStable();

    await expect(appAlertEmitPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.stringMatching(/Unknown Error/),
      }),
    );
  });

  it('should handle Facebook login errors: cannot connect', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.facebookLogin.mockReturnValue(
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const facebookButton = debugElement.query(By.css('button#facebook-login'))
      .nativeElement as HTMLButtonElement;
    facebookButton.click();
    await componentFixture.whenStable();

    await expect(appAlertEmitPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.stringMatching(/Unable to connect to server/),
      }),
    );
  });

  it('should handle Facebook login errors: new credentials', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.facebookLogin.mockReturnValue(
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
  });

  it('should handle Facebook login errors: unknown error', async () => {
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.facebookLogin.mockReturnValue(
      throwError(() => new Error('unknown error')),
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    const debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const facebookButton = debugElement.query(By.css('button#facebook-login'))
      .nativeElement as HTMLButtonElement;
    facebookButton.click();
    await componentFixture.whenStable();

    await expect(appAlertEmitPromise).resolves.toEqual(
      expect.objectContaining({
        text: expect.stringMatching(/Unknown Error/),
      }),
    );
  });
});
