import { TestBed, async } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Injectable, Component } from '@angular/core';

import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { BehaviorSubject, of } from 'rxjs';

import {
  GAuthService,
  FBAuthService,
  LoginService,
  AlertService,
} from '@app/services';

import { LoginComponent } from './login.component';

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
      ReactiveFormsModule,
      HttpClientTestingModule,

      NgbModalModule,

      SnackbarModule.forRoot(),

      RouterTestingModule.withRoutes([
        {
          path: 'main',
          component: MockComponent,
        },
      ]),
    ],
    declarations: [LoginComponent],
    providers: [
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
    loginService: mockLoginService,
    alertService: mockAlertService,
  };
}

describe('AppComponent', () => {
  it('should create the component', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    expect(component).toBeTruthy();
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
    const { loginService } = await setup();
    loginService.getGoogleLoginSession.and.returnValue(of('atoken'));

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
    const { loginService } = await setup();
    loginService.getFacebookLoginSession.and.returnValue(of('atoken'));

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

  // TODO more tests
});
