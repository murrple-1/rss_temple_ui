import { fakeAsync } from '@angular/core/testing';
import { GAuthService } from './gauth.service';

function setup() {
  const gAuthService = new GAuthService();

  return {
    gAuthService,
  };
}

describe('GAuthService', () => {
  afterAll(() => {
    (window as any).gapi = undefined;
  });

  it('should load', () => {
    const { gAuthService } = setup();

    (window as any).gapi = {
      load: jasmine
        .createSpy('gapi.load')
        .and.callFake((_apiName: string, callback: gapi.LoadCallback) => {
          callback();
        }),
      auth2: {
        init: jasmine.createSpy('gapi.auth2.init').and.callFake(
          () =>
            (({
              then: (onInit: (googleAuth: gapi.auth2.GoogleAuth) => any) => {
                onInit(({
                  isSignedIn: {
                    listen: (_listener: (isSignedIn: boolean) => void) => {},
                  },
                  currentUser: {
                    listen: (
                      _listener: (currentUser: gapi.auth2.GoogleUser) => void,
                    ) => {},
                  },
                } as any) as gapi.auth2.GoogleAuth);
              },
            } as any) as gapi.auth2.GoogleAuth),
        ),
      },
    };

    gAuthService.load();

    expect(gAuthService.isLoaded).toBeTrue();
  });

  it('should be possible to sign in and succeed', fakeAsync(async () => {
    const { gAuthService } = setup();

    let isSignedInListener: ((isSignedIn: boolean) => void) | null = null;
    let currentUserListener:
      | ((isSignedIn: gapi.auth2.GoogleUser) => void)
      | null = null;
    (window as any).gapi = {
      load: jasmine
        .createSpy('gapi.load')
        .and.callFake((_apiName: string, callback: gapi.LoadCallback) => {
          callback();
        }),
      auth2: {
        init: jasmine.createSpy('gapi.auth2.init').and.callFake(
          () =>
            (({
              then: (onInit: (googleAuth: gapi.auth2.GoogleAuth) => any) => {
                onInit(({
                  isSignedIn: {
                    listen: (listener: (isSignedIn: boolean) => void) => {
                      isSignedInListener = listener;
                    },
                  },
                  currentUser: {
                    listen: (
                      listener: (currentUser: gapi.auth2.GoogleUser) => void,
                    ) => {
                      currentUserListener = listener;
                    },
                  },
                  signIn: () => {
                    return new Promise((resolve, _reject) => {
                      if (isSignedInListener !== null) {
                        isSignedInListener(true);
                      }

                      const currentUser = ({} as any) as gapi.auth2.GoogleUser;
                      if (currentUserListener !== null) {
                        currentUserListener(currentUser);
                      }
                      resolve(currentUser);
                    });
                  },
                } as any) as gapi.auth2.GoogleAuth);
              },
            } as any) as gapi.auth2.GoogleAuth),
        ),
      },
    };

    await expectAsync(gAuthService.load()).toBeResolved();
    await expectAsync(gAuthService.signIn()).toBeResolved();

    expect(gAuthService.user).not.toBeNull();
  }));

  it('should be possible to sign out', fakeAsync(async () => {
    const { gAuthService } = setup();

    let isSignedInListener: ((isSignedIn: boolean) => void) | null = null;
    (window as any).gapi = {
      load: jasmine
        .createSpy('gapi.load')
        .and.callFake((_apiName: string, callback: gapi.LoadCallback) => {
          callback();
        }),
      auth2: {
        init: jasmine.createSpy('gapi.auth2.init').and.callFake(
          () =>
            (({
              then: (onInit: (googleAuth: gapi.auth2.GoogleAuth) => any) => {
                onInit(({
                  isSignedIn: {
                    listen: (listener: (isSignedIn: boolean) => void) => {
                      isSignedInListener = listener;
                    },
                  },
                  currentUser: {
                    listen: (
                      _listener: (isSignedIn: gapi.auth2.GoogleUser) => void,
                    ) => {},
                  },
                  signOut: () => {
                    if (isSignedInListener !== null) {
                      isSignedInListener(false);
                    }
                  },
                } as any) as gapi.auth2.GoogleAuth);
              },
            } as any) as gapi.auth2.GoogleAuth),
        ),
      },
    };

    await expectAsync(gAuthService.load()).toBeResolved();
    await expectAsync(gAuthService.signOut()).toBeResolved();

    expect(gAuthService.user).toBeNull();
  }));

  it('should be possible to call sign in without loading', () => {
    const { gAuthService } = setup();

    expect(() => gAuthService.signIn()).toThrowError();
  });

  it('should be possible to call sign out without loading', () => {
    const { gAuthService } = setup();

    expect(() => gAuthService.signOut()).toThrowError();
  });
});
