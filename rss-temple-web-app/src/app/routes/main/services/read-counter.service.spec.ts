import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthStateService } from '@app/services';
import { FeedEntryService, FeedService } from '@app/services/data';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { ReadCounterService } from './read-counter.service';

describe('ReadCounterService', () => {
  beforeEach(() => {
    const mockFeedService = {
      queryAll: vi.fn().mockName('FeedService.queryAll'),
    };
    mockFeedService.queryAll.mockReturnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: vi.fn().mockName('Router.navigate'),
          },
        },
        {
          provide: MOCK_COOKIE_SERVICE_CONFIG,
          useValue: {},
        },
        {
          provide: CookieService,
          useClass: MockCookieService,
        },
        {
          provide: FeedService,
          useValue: mockFeedService,
        },
        {
          provide: FeedEntryService,
          useValue: {
            query: vi.fn().mockName('FeedEntryService.query'),
          },
        },
        ReadCounterService,
      ],
    });
  });

  beforeEach(() => {
    const authStateService = TestBed.inject(AuthStateService);
    authStateService.removeLoggedInFlagFromCookieStorage();
    authStateService.removeLoggedInFlagFromLocalStorage();
  });

  it('should initialize', () => {
    const readCounterService = TestBed.inject(ReadCounterService);

    expect(readCounterService).toBeTruthy();
  });

  // TODO more tests
});
