import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { skip } from 'rxjs/operators';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

    vi.spyOn(document, 'createElement').mockImplementation(() => scriptElement);
    vi.spyOn(document, 'getElementById').mockImplementation(() => null);
    vi.spyOn(document.head, 'appendChild').mockImplementation(
      () => undefined as any,
    );
    const fbAuthService = TestBed.inject(FBAuthService);

    fbAuthService.load();

    expect(fbAuthService.isLoaded).toBe(false);

    expect(document.createElement).toHaveBeenCalled();
    expect(scriptElement.id).toBe('fb-jssdk');
    expect(scriptElement.src).toEqual(
      expect.stringMatching(/\/\/connect.facebook.net\/.+?sdk\.js$/),
    );

    (window as any).FB = {
      init: vi.fn(),
      AppEvents: {
        logPageView: vi.fn(),
      },
    };

    (window as any).fbAsyncInit();

    expect(FB.init).toHaveBeenCalledWith(
      expect.objectContaining({
        appId: expect.any(String),
        version: expect.any(String),
      }),
    );
    expect(FB.AppEvents.logPageView).toHaveBeenCalled();
    expect(fbAuthService.isLoaded).toBe(true);
  });

  it('should fail to load if script element already present', () => {
    const scriptElement = document.createElement('script');

    vi.spyOn(document, 'createElement');
    vi.spyOn(document, 'getElementById').mockImplementation(
      () => scriptElement,
    );
    vi.spyOn(document.head, 'appendChild');

    const fbAuthService = TestBed.inject(FBAuthService);

    fbAuthService.load();

    expect(document.getElementById).toHaveBeenCalled();
    expect(document.createElement).not.toHaveBeenCalled();
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });

  it('should be possible to sign in and succeed', async () => {
    (window as any).FB = {
      login: vi
        .fn()
        .mockImplementation(
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

    await expect(fbAuthService.signIn()).resolves.not.toThrow();
    expect(fbAuthService.user).not.toBeNull();

    expect(FB.login).toHaveBeenCalled();
  });

  it('should be possible to sign in and fail', async () => {
    (window as any).FB = {
      login: vi
        .fn()
        .mockImplementation(
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

    await expect(fbAuthService.signIn()).rejects.toThrow();
    expect(fbAuthService.user).toBeNull();

    expect(FB.login).toHaveBeenCalled();
  });

  it('should be possible to sign out', async () => {
    const fbAuthService = TestBed.inject(FBAuthService);
    const userFn = vi.fn();
    const userSubscription = fbAuthService.user$.pipe(skip(1)).subscribe({
      next: userFn,
    });
    try {
      (window as any).FB = {
        getLoginStatus: vi
          .fn()
          .mockImplementation(
            (callback: (response: { status: string }) => void) => {
              callback({
                status: 'connected',
              });
            },
          ),
        logout: vi.fn().mockImplementation((callback: () => void) => {
          callback();
        }),
      };

      await expect(fbAuthService.signOut()).resolves.not.toThrow();
    } finally {
      userSubscription.unsubscribe();
    }

    expect(userFn).toHaveBeenCalledTimes(1);
    expect(userFn).toHaveBeenCalledWith(null);
  });
});
