import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { of } from 'rxjs';

import {
  FeedService,
  UserCategoryService,
  FeedEntryService,
  OPMLService,
  ProgressService,
} from '@app/services/data';
import {
  FeedObservableService,
  UserCategoryObservableService,
  ReadCounterService,
} from '@app/routes/main/services';
import { VerticalNavComponent } from '@app/routes/main/components/shared/vertical-nav/vertical-nav.component';
import { SubscribeModalComponent } from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import { OPMLModalComponent } from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';
import { UserCategoriesModalComponent } from '@app/routes/main/components/feed/user-categories-modal/user-categories-modal.component';
import { FeedsFooterComponent } from '@app/routes/main/components/shared/feeds-footer/feeds-footer.component';
import { InfiniteScrollDirective } from '@app/routes/main/directives/infinite-scroll.directive';

import { FeedComponent } from './feed.component';

async function setup() {
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
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [
      FeedComponent,
      VerticalNavComponent,
      SubscribeModalComponent,
      OPMLModalComponent,
      UserCategoriesModalComponent,
      FeedsFooterComponent,
      InfiniteScrollDirective,
    ],
    providers: [
      FeedObservableService,
      UserCategoryObservableService,
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
        provide: ReadCounterService,
        useValue: mockReadCounterService,
      },
    ],
  }).compileComponents();

  return {
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
      const { mockUserCategoryService, mockFeedService } = await setup();
      mockUserCategoryService.queryAll.and.returnValue(
        of({
          objects: [],
          totalCount: 0,
        }),
      );
      mockFeedService.queryAll.and.returnValue(
        of({
          objects: [],
          totalCount: 0,
        }),
      );

      const componentFixture = TestBed.createComponent(FeedComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
      componentFixture.detectChanges();
      await componentFixture.whenStable();
    }),
  );

  // TODO more tests
});
