import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { GAuthService } from './gauth.service';

describe('GAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            googleClientId: '',
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
    (window as any).gapi = undefined;
  });

  it('should load', () => {
    (window as any).gapi = {
      load: vi
        .fn()
        .mockImplementation((_apiName: string, callback: gapi.LoadCallback) => {
          callback();
        }),
      auth2: {
        init: vi.fn().mockImplementation(
          () =>
            ({
              then: (onInit: (googleAuth: gapi.auth2.GoogleAuth) => any) => {
                onInit({
                  isSignedIn: {
                    listen: (_listener: (isSignedIn: boolean) => void) => {},
                  },
                  currentUser: {
                    listen: (
                      _listener: (currentUser: gapi.auth2.GoogleUser) => void,
                    ) => {},
                  },
                } as any as gapi.auth2.GoogleAuth);
              },
            }) as any as gapi.auth2.GoogleAuth,
        ),
      },
    };

    const gAuthService = TestBed.inject(GAuthService);
    gAuthService.load();

    expect(gAuthService.isLoaded).toBe(true);
  });

  it('should be possible to sign in and succeed', async () => {
    let isSignedInListener: ((isSignedIn: boolean) => void) | null = null;
    let currentUserListener:
      | ((isSignedIn: gapi.auth2.GoogleUser) => void)
      | null = null;
    (window as any).gapi = {
      load: vi
        .fn()
        .mockImplementation((_apiName: string, callback: gapi.LoadCallback) => {
          callback();
        }),
      auth2: {
        init: vi.fn().mockImplementation(
          () =>
            ({
              then: (onInit: (googleAuth: gapi.auth2.GoogleAuth) => any) => {
                onInit({
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
                  signIn: () =>
                    new Promise((resolve, _reject) => {
                      if (isSignedInListener !== null) {
                        isSignedInListener(true);
                      }

                      const currentUser = {} as any as gapi.auth2.GoogleUser;
                      if (currentUserListener !== null) {
                        currentUserListener(currentUser);
                      }
                      resolve(currentUser);
                    }),
                } as any as gapi.auth2.GoogleAuth);
              },
            }) as any as gapi.auth2.GoogleAuth,
        ),
      },
    };

    const gAuthService = TestBed.inject(GAuthService);
    await expect(gAuthService.load()).resolves.not.toThrow();
    await expect(gAuthService.signIn()).resolves.not.toThrow();

    expect(gAuthService.user).not.toBeNull();
  });

  it('should be possible to sign out', async () => {
    let isSignedInListener: ((isSignedIn: boolean) => void) | null = null;
    (window as any).gapi = {
      load: vi
        .fn()
        .mockImplementation((_apiName: string, callback: gapi.LoadCallback) => {
          callback();
        }),
      auth2: {
        init: vi.fn().mockImplementation(
          () =>
            ({
              then: (onInit: (googleAuth: gapi.auth2.GoogleAuth) => any) => {
                onInit({
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
                } as any as gapi.auth2.GoogleAuth);
              },
            }) as any as gapi.auth2.GoogleAuth,
        ),
      },
    };

    const gAuthService = TestBed.inject(GAuthService);
    await expect(gAuthService.load()).resolves.not.toThrow();
    await expect(gAuthService.signOut()).resolves.not.toThrow();

    expect(gAuthService.user).toBeNull();
  });

  it('should be possible to call sign in without loading', () => {
    const gAuthService = TestBed.inject(GAuthService);

    expect(() => gAuthService.signIn()).toThrowError();
  });

  it('should be possible to call sign out without loading', () => {
    const gAuthService = TestBed.inject(GAuthService);

    expect(() => gAuthService.signOut()).toThrowError();
  });
});
