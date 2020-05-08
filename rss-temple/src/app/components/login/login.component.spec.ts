import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Injectable } from '@angular/core';

import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { BehaviorSubject } from 'rxjs';

import { GAuthService, FBAuthService } from '@app/services';

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

function setup() {
  TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,
      HttpClientTestingModule,

      NgbModalModule,

      SnackbarModule.forRoot(),

      RouterTestingModule.withRoutes([]),
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
    ],
  }).compileComponents();

  const httpMock = TestBed.inject(HttpTestingController);

  return {
    httpMock,
  };
}

describe('AppComponent', () => {
  it('should create the component', () => {
    setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;
    expect(component).toBeTruthy();
  });

  it('can run ngOnInit', () => {
    setup();

    const componentFixture = TestBed.createComponent(LoginComponent);
    const component = componentFixture.debugElement
      .componentInstance as LoginComponent;

    component.ngOnInit();
    expect().nothing();
  });

  // TODO more tests
});
