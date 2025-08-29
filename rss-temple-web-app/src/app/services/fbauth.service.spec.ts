import { provideHttpClient } from '@angular/common/http';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { skip } from 'rxjs/operators';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { FBAuthService } from './fbauth.service';

describe('FBAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            facebookAppId: '',
          },
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    });
  });

  afterAll(() => {
    (window as any).FB = undefined;
  });

  it('should load', () => {
    const scriptElement = document.createElement('script');

    spyOn(document, 'createElement').and.callFake(() => scriptElement);
    spyOn(document, 'getElementById').and.callFake(() => null);
    spyOn(document.head, 'appendChild').and.callFake(() => undefined as any);
    const fbAuthService = TestBed.inject(FBAuthService);

    fbAuthService.load();

    expect(fbAuthService.isLoaded).toBeFalse();

    expect(document.createElement).toHaveBeenCalled();
    expect(scriptElement.id).toBe('fb-jssdk');
    expect(scriptElement.src).toEqual(
      jasmine.stringMatching(/\/\/connect.facebook.net\/.+?sdk\.js$/),
    );

    (window as any).FB = {
      init: jasmine.createSpy('FB.init'),
      AppEvents: {
        logPageView: jasmine.createSpy('FB.AppEvents.logPageView'),
      },
    };

    (window as any).fbAsyncInit();

    expect(FB.init).toHaveBeenCalledWith(
      jasmine.objectContaining({
        appId: jasmine.any(String),
        version: jasmine.any(String),
      }),
    );
    expect(FB.AppEvents.logPageView).toHaveBeenCalled();
    expect(fbAuthService.isLoaded).toBeTrue();
  });

  it('should fail to load if script element already present', () => {
    const scriptElement = document.createElement('script');

    spyOn(document, 'createElement');
    spyOn(document, 'getElementById').and.callFake(() => scriptElement);
    spyOn(document.head, 'appendChild');

    const fbAuthService = TestBed.inject(FBAuthService);

    fbAuthService.load();

    expect(document.getElementById).toHaveBeenCalled();
    expect(document.createElement).not.toHaveBeenCalled();
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });

  it('should be possible to sign in and succeed', fakeAsync(async () => {
    (window as any).FB = {
      login: jasmine
        .createSpy('FB.login')
        .and.callFake(
          (callback: (response: facebook.StatusResponse) => void) => {
            callback({
              status: 'connected',
              authResponse: {
                accessToken: '',
                expiresIn: 0,
                signedRequest: '',
                userID: '',
                data_access_expiration_time: 0,
              },
            });
          },
        ),
    };

    const fbAuthService = TestBed.inject(FBAuthService);

    await expectAsync(fbAuthService.signIn()).toBeResolved();
    expect(fbAuthService.user).not.toBeNull();

    expect(FB.login).toHaveBeenCalled();
  }));

  it('should be possible to sign in and fail', fakeAsync(async () => {
    (window as any).FB = {
      login: jasmine
        .createSpy('FB.login')
        .and.callFake(
          (callback: (response: facebook.StatusResponse) => void) => {
            callback({
              status: 'unknown',
              authResponse: {
                accessToken: '',
                expiresIn: 0,
                signedRequest: '',
                userID: '',
                data_access_expiration_time: 0,
              },
            });
          },
        ),
    };

    const fbAuthService = TestBed.inject(FBAuthService);

    await expectAsync(fbAuthService.signIn()).toBeRejected();
    expect(fbAuthService.user).toBeNull();

    expect(FB.login).toHaveBeenCalled();
  }));

  it('should be possible to sign out', fakeAsync(async () => {
    const fbAuthService = TestBed.inject(FBAuthService);
    const userFn = jasmine.createSpy();
    const userSubscription = fbAuthService.user$.pipe(skip(1)).subscribe({
      next: userFn,
    });
    try {
      (window as any).FB = {
        getLoginStatus: jasmine
          .createSpy('FB.getLoginStatus')
          .and.callFake((callback: (response: { status: string }) => void) => {
            callback({
              status: 'connected',
            });
          }),
        logout: jasmine
          .createSpy('FB.logout')
          .and.callFake((callback: () => void) => {
            callback();
          }),
      };

      await expectAsync(fbAuthService.signOut()).toBeResolved();
    } finally {
      userSubscription.unsubscribe();
    }

    expect(userFn).toHaveBeenCalledTimes(1);
    expect(userFn).toHaveBeenCalledWith(null);
  }));
});
