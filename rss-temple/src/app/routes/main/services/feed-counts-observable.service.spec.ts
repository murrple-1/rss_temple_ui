import { Router } from '@angular/router';

import {
  AppAlertsService,
  HttpErrorService,
  SessionService,
} from '@app/services';
import { FeedService } from '@app/services/data';

import { FeedCountsObservableService } from './feed-counts-observable.service';

function setup() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  const appAlertService = new AppAlertsService();
  const sessionService = new SessionService();
  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'queryAll',
  ]);
  const httpErrorService = new HttpErrorService(
    routerSpy,
    appAlertService,
    sessionService,
  );

  const feedCountsObservableService = new FeedCountsObservableService(
    sessionService,
    mockFeedService,
    httpErrorService,
  );

  return {
    routerSpy,

    appAlertService,
    sessionService,
    mockFeedService,
    httpErrorService,

    feedCountsObservableService,
  };
}

describe('FeedCountsObservableService', () => {
  beforeEach(() => {
    localStorage.removeItem('sessionToken');
  });

  it('should init', () => {
    const { feedCountsObservableService } = setup();
    expect(feedCountsObservableService).toBeTruthy();
  });

  // TODO more tests
});
