import { Router } from '@angular/router';

import { of } from 'rxjs';

import {
  AppAlertsService,
  HttpErrorService,
  AuthTokenService,
} from '@app/services';
import { FeedEntryService, FeedService } from '@app/services/data';

import { ReadCounterService } from './read-counter.service';

function setup() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  const appAlertService = new AppAlertsService();
  const authTokenService = new AuthTokenService();
  const httpErrorService = new HttpErrorService(
    routerSpy,
    appAlertService,
    authTokenService,
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
    authTokenService,
    mockFeedEntryService,
    mockFeedService,
    httpErrorService,
  );

  return {
    routerSpy,
    appAlertService,
    authTokenService,
    httpErrorService,

    readCounterService,
  };
}

describe('UserCategoryObservableService', () => {
  it('should initialize', () => {
    const { readCounterService } = setup();
    expect(readCounterService).toBeTruthy();
  });

  // TODO more tests
});
