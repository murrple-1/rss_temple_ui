import { Router } from '@angular/router';

import { of } from 'rxjs';

import {
  AppAlertsService,
  HttpErrorService,
  SessionService,
} from '@app/services';
import { FeedEntryService, FeedService } from '@app/services/data';

import { ReadCounterService } from './read-counter.service';

function setup() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  const appAlertService = new AppAlertsService();
  const sessionService = new SessionService();
  const httpErrorService = new HttpErrorService(
    routerSpy,
    appAlertService,
    sessionService,
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
    sessionService,
    mockFeedEntryService,
    mockFeedService,
    httpErrorService,
  );

  return {
    routerSpy,
    appAlertService,
    sessionService,
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
