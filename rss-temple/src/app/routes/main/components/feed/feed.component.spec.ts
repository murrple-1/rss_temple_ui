import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import {
  FeedService,
  UserCategoryService,
  FeedEntryService,
} from '@app/services/data';
import {
  FeedObservableService,
  DisplayObservableService,
} from '@app/routes/main/services';
import { DisplayOptionsViewComponent } from '@app/routes/main/components/shared/display-options/display-options.component';

import { FeedComponent } from './feed.component';

async function setup() {
  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'get',
    'subscribe',
    'unsubscribe',
  ]);
  const mockUserCategoryService = jasmine.createSpyObj<UserCategoryService>(
    'UserCategoryService',
    ['queryAll', 'apply'],
  );
  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query', 'read', 'unread'],
  );

  await TestBed.configureTestingModule({
    imports: [RouterTestingModule.withRoutes([])],
    declarations: [FeedComponent, DisplayOptionsViewComponent],
    providers: [
      FeedObservableService,
      DisplayObservableService,
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
    ],
  }).compileComponents();

  return {
    mockFeedService,
    mockUserCategoryService,
    mockFeedEntryService,
  };
}

describe('FeedComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(FeedComponent);
      const component = componentFixture.debugElement
        .componentInstance as FeedComponent;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'can run ngOnInit',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(FeedComponent);
      const component = componentFixture.debugElement
        .componentInstance as FeedComponent;

      component.ngOnInit();
      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  // TODO more tests
});
