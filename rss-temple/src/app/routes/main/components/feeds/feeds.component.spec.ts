import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ClarityModule } from '@clr/angular';

import { of } from 'rxjs';

import { MockActivatedRoute } from '@app/test/activatedroute.mock';
import {
  FeedService,
  FeedEntryService,
  OPMLService,
  ProgressService,
  UserCategoryService,
} from '@app/services/data';
import {
  FeedObservableService,
  ReadCounterService,
  UserCategoryObservableService,
} from '@app/routes/main/services';
import { VerticalNavComponent } from '@app/routes/main/components/shared/vertical-nav/vertical-nav.component';
import { SubscribeModalComponent } from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import { OPMLModalComponent } from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';
import { FeedsFooterComponent } from '@app/routes/main/components/shared/feeds-footer/feeds-footer.component';

import { FeedsComponent } from './feeds.component';

async function setup() {
  const mockRoute = new MockActivatedRoute();

  const mockReadCounterService = jasmine.createSpyObj<ReadCounterService>(
    'ReadCounterService',
    ['readAll'],
  );
  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query', 'readSome', 'unreadSome'],
  );
  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'queryAll',
  ]);

  const mockOPMLService = jasmine.createSpyObj<OPMLService>('OPMLService', [
    'upload',
  ]);
  const mockProgressService = jasmine.createSpyObj<ProgressService>(
    'ProgressService',
    ['checkProgress'],
  );
  const mockUserCategoryService = jasmine.createSpyObj<UserCategoryService>(
    'UserCategoryService',
    ['queryAll'],
  );

  await TestBed.configureTestingModule({
    imports: [FormsModule, ClarityModule, RouterTestingModule.withRoutes([])],
    declarations: [
      FeedsComponent,
      VerticalNavComponent,
      SubscribeModalComponent,
      OPMLModalComponent,
      FeedsFooterComponent,
    ],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: mockRoute,
      },

      FeedObservableService,
      UserCategoryObservableService,
      {
        provide: FeedService,
        useValue: mockFeedService,
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
        provide: UserCategoryService,
        useValue: mockUserCategoryService,
      },
      {
        provide: ReadCounterService,
        useValue: mockReadCounterService,
      },
    ],
  }).compileComponents();

  return {
    mockRoute,

    mockFeedService,
    mockFeedEntryService,
    mockOPMLService,
    mockProgressService,
    mockUserCategoryService,
    mockReadCounterService,
  };
}

describe('FeedsComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(FeedsComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'can run ngOnInit',
    waitForAsync(async () => {
      const { mockFeedEntryService } = await setup();
      mockFeedEntryService.query.and.returnValue(
        of({
          objects: [],
          totalCount: 0,
        }),
      );

      const componentFixture = TestBed.createComponent(FeedsComponent);
      const component = componentFixture.componentInstance;

      component.ngOnInit();

      expect().nothing();
    }),
  );

  // TODO more tests
});
