import { Router } from '@angular/router';
import { of } from 'rxjs';

import {
  AppAlertsService,
  AuthStateService,
  HttpErrorService,
} from '@app/services';
import { FeedEntryService, FeedService } from '@app/services/data';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { ReadCounterService } from './read-counter.service';

function setup() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  const appAlertService = new AppAlertsService();
  const mockCookieService = new MockCookieService({});
  const authStateService = new AuthStateService(mockCookieService);
  const httpErrorService = new HttpErrorService(
    routerSpy,
    appAlertService,
    authStateService,
  );

  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'queryAll',
  ]);
  mockFeedService.queryAll.and.returnValue(
    of({
      objects: [],
      totalCount: 0,
    }),
  );

  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query'],
  );

  const readCounterService = new ReadCounterService(
    authStateService,
    mockFeedEntryService,
    mockFeedService,
    httpErrorService,
  );

  return {
    routerSpy,
    appAlertService,
    authStateService,
    httpErrorService,

    readCounterService,
  };
}

describe('UserCategoryObservableService', () => {
  beforeEach(() => {
    const mockCookieService = new MockCookieService({});
    const authStateService = new AuthStateService(mockCookieService);
    authStateService.removeLoggedInFlagFromCookieStorage();
    authStateService.removeLoggedInFlagFromLocalStorage();
  });

  it('should initialize', () => {
    const { readCounterService } = setup();
    expect(readCounterService).toBeTruthy();
  });

  // TODO more tests
});
