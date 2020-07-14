import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  UrlSegment,
  Params,
  Data,
  Route,
  ParamMap,
  Router,
} from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable, Component, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';

import {
  NgbModalModule,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { BehaviorSubject, of, Observable } from 'rxjs';

import {
  GAuthService,
  FBAuthService,
  LoginService,
  AlertService,
} from '@app/services';

import { LoginComponent, State } from './login.component';

class MockParamMap implements ParamMap {
  _map = new Map<string, string>();

  get keys(): string[] {
    return Array.from(this._map.keys());
  }

  has(name: string): boolean {
    throw new Error('Method not implemented.');
  }

  get(name: string): string | null {
    const value = this._map.get(name);
    if (value !== undefined) {
      return value;
    } else {
      return null;
    }
  }

  getAll(name: string): string[] {
    throw new Error('Method not implemented.');
  }
}

class MockActivatedRouteSnapshot implements ActivatedRouteSnapshot {
  url: UrlSegment[] = [];
  params: Params = {};
  queryParams: Params = {};
  fragment = '';
  data: Data = {};
  outlet = '';
  component: string | Type<any> | null = null;
  routeConfig: Route | null = null;

  _paramMap = new MockParamMap();

  get root(): ActivatedRouteSnapshot {
    throw new Error('Method not implemented.');
  }

  get parent(): ActivatedRouteSnapshot | null {
    throw new Error('Method not implemented.');
  }

  get firstChild(): ActivatedRouteSnapshot | null {
    throw new Error('Method not implemented.');
  }

  get children(): ActivatedRouteSnapshot[] {
    throw new Error('Method not implemented.');
  }

  get pathFromRoot(): ActivatedRouteSnapshot[] {
    throw new Error('Method not implemented.');
  }

  get paramMap(): ParamMap {
    return this._paramMap;
  }

  get queryParamMap(): ParamMap {
    throw new Error('Method not implemented.');
  }

  toString(): string {
    throw new Error('Method not implemented.');
  }
}

class MockActivatedRoute implements ActivatedRoute {
  url = new Observable<UrlSegment[]>(_subscriber => {});
  params = new Observable<Params>(_subscriber => {});
  queryParams = new Observable<Params>(_subscriber => {});
  fragment = new Observable<string>(_subscriber => {});
  data = new Observable<Data>(_subscriber => {});
  outlet = '';
  component: string | Type<any> | null = null;
  snapshot = new MockActivatedRouteSnapshot();

  get routeConfig(): Route | null {
    throw new Error('Method not implemented.');
  }

  get root(): ActivatedRoute {
    throw new Error('Method not implemented.');
  }

  get parent(): ActivatedRoute | null {
    throw new Error('Method not implemented.');
  }

  get firstChild(): ActivatedRoute | null {
    throw new Error('Method not implemented.');
  }

  get children(): ActivatedRoute[] {
    throw new Error('Method not implemented.');
  }

  get pathFromRoot(): ActivatedRoute[] {
    throw new Error('Method not implemented.');
  }

  get paramMap(): Observable<ParamMap> {
    throw new Error('Method not implemented.');
  }

  get queryParamMap(): Observable<ParamMap> {
    throw new Error('Method not implemented.');
  }

  toString(): string {
    throw new Error('Method not implemented.');
  }
}

@Injectable()
class MockGAuthService extends GAuthService {
  user$ = new BehaviorSubject<gapi.auth2.GoogleUser | null>(null);
  isLoaded$ = new BehaviorSubject<boolean>(false);

  get user() {
    return this.user$.getValue();
  }

  get isLoaded() {
    return this.isLoaded$.getValue();
  }

  load() {
    this.isLoaded$.next(true);
  }

  signIn() {
    const user = {
      getAuthResponse: () => {
        return {
          id_token: 'id_token',
        };
      },
    } as gapi.auth2.GoogleUser;
    this.user$.next(user);
  }

  signOut() {
    this.user$.next(null);
  }
}

@Injectable()
class MockFBAuthService extends FBAuthService {
  user$ = new BehaviorSubject<facebook.AuthResponse | null>(null);
  isLoaded$ = new BehaviorSubject<boolean>(false);

  get user() {
    return this.user$.getValue();
  }

  get isLoaded() {
    return this.isLoaded$.getValue();
  }

  load() {
    this.isLoaded$.next(true);
  }

  signIn() {
    const user = {
      accessToken: 'accessToken',
    } as facebook.AuthResponse;
    this.user$.next(user);
  }

  signOut() {
    this.user$.next(null);
  }
}

@Component({})
class MockComponent {}

async function setup() {
  const mockModal = jasmine.createSpyObj<NgbModal>('NgbModal', ['open']);
  const mockRoute = new MockActivatedRoute();

  const mockLoginService = jasmine.createSpyObj<LoginService>('LoginService', [
    'getMyLoginSession',
    'getGoogleLoginSession',
    'getFacebookLoginSession',
  ]);
  const mockAlertService = jasmine.createSpyObj<AlertService>('AlertService', [
    'error',
  ]);

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      ReactiveFormsModule,
      HttpClientTestingModule,

      NgbModalModule,

      SnackbarModule.forRoot(),

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
    declarations: [MockComponent, LoginComponent],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: mockRoute,
      },
      {
        provide: NgbModal,
        useValue: mockModal,
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
        provide: AlertService,
        useValue: mockAlertService,
      },
    ],
  }).compileComponents();

  return {
    mockRoute,
    mockModal,

    mockLoginService,
    mockAlertService,
  };
}

describe('LoginComponent', () => {
  it('should create the component', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    expect(component).toBeTruthy();
  }));

  it('should create component with returnUrl', async(async () => {
    const { mockRoute } = await setup();

    const returnUrl = 'http://test.com';
    mockRoute.snapshot._paramMap._map.set('returnUrl', returnUrl);

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;

    component.ngOnInit();
    await componentFixture.whenStable();

    expect(component.returnUrl).toBe(returnUrl);
  }));

  it('can run ngOnInit', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;

    component.ngOnInit();
    await componentFixture.whenStable();
    expect().nothing();
  }));

  it('should handle Google login', async(async () => {
    const { mockLoginService } = await setup();
    mockLoginService.getGoogleLoginSession.and.returnValue(of('atoken'));

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;

    component.ngOnInit();

    const gAuthService = TestBed.inject(GAuthService);
    gAuthService.signIn();
    await componentFixture.whenStable();
    expect().nothing();
  }));

  it('should handle Facebook login', async(async () => {
    const { mockLoginService } = await setup();
    mockLoginService.getFacebookLoginSession.and.returnValue(of('atoken'));

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;

    component.ngOnInit();

    const fbAuthService = TestBed.inject(FBAuthService);
    fbAuthService.signIn();
    await componentFixture.whenStable();
    expect().nothing();
  }));

  it('should logout Google if already logged in', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;

    const gAuthService = TestBed.inject(GAuthService);
    gAuthService.signIn();

    component.ngOnInit();

    await componentFixture.whenStable();
    expect().nothing();
  }));

  it('should logout Facebook if already logged in', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;

    const fbAuthService = TestBed.inject(FBAuthService);
    fbAuthService.signIn();

    component.ngOnInit();

    await componentFixture.whenStable();
    expect().nothing();
  }));

  it('should handle missing email', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
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

    expect(component.loginFormErrors.controls['email']).toEqual([
      'Email required',
    ]);
  }));

  it('should handle malformed email', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
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

    expect(component.loginFormErrors.controls['email']).toEqual([
      'Email malformed',
    ]);
  }));

  it('should handle missing password', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
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

    expect(component.loginFormErrors.controls['password']).toEqual([
      'Password required',
    ]);
  }));

  it('should be able to log in', async(async () => {
    const { mockLoginService } = await setup();
    mockLoginService.getMyLoginSession.and.returnValue(of('atoken'));

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
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

    expect(mockLoginService.getMyLoginSession).toHaveBeenCalledWith(
      'test@test.com',
      'password',
    );
  }));

  it('should be able to login with Google', async(async () => {
    const { mockLoginService } = await setup();
    mockLoginService.getGoogleLoginSession.and.returnValue(of('atoken'));

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const gAuthService = debugElement.injector.get(
      GAuthService,
    ) as MockGAuthService;

    const googleButton = debugElement.query(By.css('button#google-login'))
      .nativeElement as HTMLButtonElement;
    googleButton.click();
    await componentFixture.whenStable();

    expect(gAuthService.user).toBeTruthy();
  }));

  it('should be able to login with Facebook', async(async () => {
    const { mockLoginService } = await setup();
    mockLoginService.getFacebookLoginSession.and.returnValue(of('atoken'));

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const fbAuthService = debugElement.injector.get(
      FBAuthService,
    ) as MockFBAuthService;

    const facebookButton = debugElement.query(By.css('button#facebook-login'))
      .nativeElement as HTMLButtonElement;
    facebookButton.click();
    await componentFixture.whenStable();

    expect(fbAuthService.user).toBeTruthy();
  }));

  it('should be possible to forget your password', async(async () => {
    const { mockModal } = await setup();
    mockModal.open.and.returnValue({
      result: Promise.resolve(),
    } as NgbModalRef);

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const forgotPasswordLink = debugElement.query(
      By.css('a#forgotten-password'),
    ).nativeElement as HTMLAnchorElement;
    forgotPasswordLink.click();
    await componentFixture.whenStable();

    expect(mockModal.open).toHaveBeenCalled();
  }));

  it('should handle Google logout', async(async () => {
    const { mockLoginService } = await setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const gAuthService = debugElement.injector.get(
      GAuthService,
    ) as MockGAuthService;

    gAuthService.user$.next(null);
    await componentFixture.whenStable();

    expect(mockLoginService.getGoogleLoginSession).not.toHaveBeenCalled();
  }));

  it('should handle Facebook logout', async(async () => {
    const { mockLoginService } = await setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const fbAuthService = debugElement.injector.get(
      FBAuthService,
    ) as MockFBAuthService;

    fbAuthService.user$.next(null);
    await componentFixture.whenStable();

    expect(mockLoginService.getFacebookLoginSession).not.toHaveBeenCalled();
  }));

  it('should handle login errors: cannot connect', async(async () => {
    const { mockLoginService, mockAlertService } = await setup();
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
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

    expect(mockAlertService.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/Unable to connect to server/),
      jasmine.any(Number),
    );
    expect(component.state).toBe(State.LoginFailed);
  }));

  it('should handle login errors: bad credentials', async(async () => {
    const { mockLoginService, mockAlertService } = await setup();
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
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

    expect(mockAlertService.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/Email or password wrong/),
      jasmine.any(Number),
    );
    expect(component.state).toBe(State.LoginFailed);
  }));

  it('should handle login errors: unknown error', async(async () => {
    const { mockLoginService, mockAlertService } = await setup();
    mockLoginService.getMyLoginSession.and.returnValue(
      new Observable<string>(subscriber => {
        subscriber.error(new Error('unknown error'));
      }),
    );
    spyOn(console, 'error');

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
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

    expect(mockAlertService.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/Unknown Error/),
      jasmine.any(Number),
    );
    expect(component.state).toBe(State.LoginFailed);
  }));

  it('should handle Google login errors: cannot connect', async(async () => {
    const { mockLoginService, mockAlertService } = await setup();
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const googleButton = debugElement.query(By.css('button#google-login'))
      .nativeElement as HTMLButtonElement;
    googleButton.click();
    await componentFixture.whenStable();

    expect(mockAlertService.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/Unable to connect to server/),
      jasmine.any(Number),
    );
    expect(component.state).toBe(State.LoginFailed);
  }));

  it('should handle Google login errors: new credentials', async(async () => {
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

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const router = debugElement.injector.get(Router);
    spyOn(router, 'navigate').and.callThrough();

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
  }));

  it('should handle Google login errors: unknown error', async(async () => {
    const { mockLoginService, mockAlertService } = await setup();
    mockLoginService.getGoogleLoginSession.and.returnValue(
      new Observable<string>(subscriber => {
        subscriber.error(new Error('unknown error'));
      }),
    );
    spyOn(console, 'error');

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const googleButton = debugElement.query(By.css('button#google-login'))
      .nativeElement as HTMLButtonElement;
    googleButton.click();
    await componentFixture.whenStable();

    expect(mockAlertService.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/Unknown Error/),
      jasmine.any(Number),
    );
    expect(component.state).toBe(State.LoginFailed);
  }));

  it('should handle Facebook login errors: cannot connect', async(async () => {
    const { mockLoginService, mockAlertService } = await setup();
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

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const facebookButton = debugElement.query(By.css('button#facebook-login'))
      .nativeElement as HTMLButtonElement;
    facebookButton.click();
    await componentFixture.whenStable();

    expect(mockAlertService.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/Unable to connect to server/),
      jasmine.any(Number),
    );
    expect(component.state).toBe(State.LoginFailed);
  }));

  it('should handle Facebook login errors: new credentials', async(async () => {
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

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const router = debugElement.injector.get(Router);
    spyOn(router, 'navigate').and.callThrough();

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
  }));

  it('should handle Facebook login errors: unknown error', async(async () => {
    const { mockLoginService, mockAlertService } = await setup();
    mockLoginService.getFacebookLoginSession.and.returnValue(
      new Observable<string>(subscriber => {
        subscriber.error(new Error('unknown error'));
      }),
    );
    spyOn(console, 'error');

    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    component.ngOnInit();

    const debugElement = componentFixture.debugElement;

    const facebookButton = debugElement.query(By.css('button#facebook-login'))
      .nativeElement as HTMLButtonElement;
    facebookButton.click();
    await componentFixture.whenStable();

    expect(mockAlertService.error).toHaveBeenCalledWith(
      jasmine.stringMatching(/Unknown Error/),
      jasmine.any(Number),
    );
    expect(component.state).toBe(State.LoginFailed);
  }));
});
