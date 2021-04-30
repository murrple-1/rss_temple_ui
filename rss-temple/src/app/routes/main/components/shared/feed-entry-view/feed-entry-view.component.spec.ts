import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';

import { FeedEntryService } from '@app/services/data';
import { DateFormatPipe } from '@app/pipes/dayjs-format.pipe';
import {
  FeedCountsObservableService,
  ReadBufferService,
} from '@app/routes/main/services';
import {
  AppAlertsService,
  HttpErrorService,
  SessionService,
} from '@app/services';

import { FeedEntryViewComponent } from './feed-entry-view.component';

async function setup() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  const mockFeedCountsObservableService = jasmine.createSpyObj<FeedCountsObservableService>(
    'FeedCountsObservableService',
    ['refresh'],
  );
  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query', 'read', 'unread'],
  );

  const appAlertService = new AppAlertsService();
  const sessionService = new SessionService();
  const httpErrorService = new HttpErrorService(
    routerSpy,
    appAlertService,
    sessionService,
  );

  const readBufferService = new ReadBufferService(
    mockFeedEntryService,
    httpErrorService,
  );

  await TestBed.configureTestingModule({
    declarations: [FeedEntryViewComponent, DateFormatPipe],
    providers: [
      {
        provide: FeedCountsObservableService,
        useValue: mockFeedCountsObservableService,
      },
      {
        provide: FeedEntryService,
        useValue: mockFeedEntryService,
      },
      {
        provide: ReadBufferService,
        useValue: readBufferService,
      },
    ],
  }).compileComponents();

  return {
    routerSpy,

    mockFeedCountsObservableService,
    mockFeedEntryService,
    readBufferService,
  };
}

describe('FeedEntryViewComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(FeedEntryViewComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  // TODO more tests
});
