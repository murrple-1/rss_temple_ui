import { Router } from '@angular/router';

import {
  AppAlertsService,
  HttpErrorService,
  SessionService,
} from '@app/services';
import { FeedEntryService } from '@app/services/data';

import { ReadBufferService } from './read-buffer.service';

function setup() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  const appAlertService = new AppAlertsService();
  const sessionService = new SessionService();
  const httpErrorService = new HttpErrorService(
    routerSpy,
    appAlertService,
    sessionService,
  );

  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query'],
  );

  const readBufferService = new ReadBufferService(
    mockFeedEntryService,
    httpErrorService,
  );

  return {
    routerSpy,
    appAlertService,
    sessionService,
    httpErrorService,

    readBufferService,
  };
}

describe('UserCategoryObservableService', () => {
  it('should initialize', () => {
    const { readBufferService } = setup();
    expect(readBufferService).toBeTruthy();
  });
});
