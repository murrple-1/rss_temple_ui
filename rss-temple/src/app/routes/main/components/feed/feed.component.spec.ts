import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ClarityModule } from '@clr/angular';

import {
  FeedService,
  UserCategoryService,
  FeedEntryService,
  OPMLService,
  ProgressService,
} from '@app/services/data';
import {
  FeedObservableService,
  FeedCountsObservableService,
  UserCategoryObservableService,
  ReadBufferService,
} from '@app/routes/main/services';
import { VerticalNavComponent } from '@app/routes/main/components/shared/vertical-nav/vertical-nav.component';
import { SubscribeModalComponent } from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import { OPMLModalComponent } from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';
import { UserCategoriesModalComponent } from '@app/routes/main/components/feed/user-categories-modal/user-categories-modal.component';
import { FeedsFooterComponent } from '@app/routes/main/components/shared/feeds-footer/feeds-footer.component';
import {
  AppAlertsService,
  HttpErrorService,
  SessionService,
} from '@app/services';

import { FeedComponent } from './feed.component';

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

  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'get',
    'subscribe',
    'unsubscribe',
  ]);
  const mockUserCategoryService = jasmine.createSpyObj<UserCategoryService>(
    'UserCategoryService',
    ['queryAll', 'apply'],
  );
  const mockOPMLService = jasmine.createSpyObj<OPMLService>('OPMLService', [
    'upload',
  ]);
  const mockProgressService = jasmine.createSpyObj<ProgressService>(
    'ProgressService',
    ['checkProgress'],
  );

  await TestBed.configureTestingModule({
    imports: [FormsModule, ClarityModule, RouterTestingModule.withRoutes([])],
    declarations: [
      FeedComponent,
      VerticalNavComponent,
      SubscribeModalComponent,
      OPMLModalComponent,
      UserCategoriesModalComponent,
      FeedsFooterComponent,
    ],
    providers: [
      FeedObservableService,
      UserCategoryObservableService,
      {
        provide: FeedCountsObservableService,
        useValue: mockFeedCountsObservableService,
      },
      {
        provide: FeedService,
        useValue: mockFeedService,
      },
      {
        provide: UserCategoryService,
        useValue: mockUserCategoryService,
      },
      {
        provide: FeedEntryService,
        useValue: mockFeedEntryService,
      },
      {
        provide: OPMLService,
        useValue: mockOPMLService,
      },
      {
        provide: ProgressService,
        useValue: mockProgressService,
      },
      {
        provide: ReadBufferService,
        useValue: readBufferService,
      },
    ],
  }).compileComponents();

  return {
    mockFeedCountsObservableService,
    mockFeedService,
    mockUserCategoryService,
    mockFeedEntryService,
    mockOPMLService,
    mockProgressService,
  };
}

describe('FeedComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(FeedComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'can run ngOnInit',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(FeedComponent);
      const component = componentFixture.componentInstance;

      component.ngOnInit();

      expect().nothing();
    }),
  );

  // TODO more tests
});
