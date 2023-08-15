import { fakeAsync } from '@angular/core/testing';

import { skip } from 'rxjs/operators';

import { MockConfigService } from '@app/test/config.service.mock';

import { FBAuthService } from './fbauth.service';

function setup() {
  const mockConfigService = new MockConfigService({
    facebookAppId: '',
  });

  const fbAuthService = new FBAuthService(mockConfigService);

  return {
    mockConfigService,
    fbAuthService,
  };
}

describe('FBAuthService', () => {
  afterAll(() => {
    (window as any).FB = undefined;
  });

  it('should load', () => {
    const { fbAuthService } = setup();

    const scriptElement = document.createElement('script');

    spyOn(document, 'createElement').and.callFake(() => scriptElement);
    spyOn(document, 'getElementById').and.callFake(() => null);
    spyOn(document.head, 'appendChild').and.callFake(() => undefined as any);

    fbAuthService.load();

    expect(document.createElement).toHaveBeenCalled();
    expect(scriptElement.id).toBe('fb-jssdk');
    expect(scriptElement.src).toEqual(
      jasmine.stringMatching(/\/\/connect.facebook.net\/.+?sdk\.js$/),
    );
    expect(fbAuthService.isLoaded).toBeFalse();

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
    const { fbAuthService } = setup();

    const scriptElement = document.createElement('script');

    spyOn(document, 'createElement');
    spyOn(document, 'getElementById').and.callFake(() => scriptElement);
    spyOn(document.head, 'appendChild');

    fbAuthService.load();

    expect(document.getElementById).toHaveBeenCalled();
    expect(document.createElement).not.toHaveBeenCalled();
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });

  it('should be possible to sign in and succeed', fakeAsync(async () => {
    const { fbAuthService } = setup();

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

    await expectAsync(fbAuthService.signIn()).toBeResolved();

    expect(FB.login).toHaveBeenCalled();
    expect(fbAuthService.user).not.toBeNull();
  }));

  it('should be possible to sign in and fail', fakeAsync(async () => {
    const { fbAuthService } = setup();

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

    await expectAsync(fbAuthService.signIn()).toBeRejected();

    expect(FB.login).toHaveBeenCalled();
    expect(fbAuthService.user).toBeNull();
  }));

  it('should be possible to sign out', fakeAsync(async () => {
    const { fbAuthService } = setup();

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
