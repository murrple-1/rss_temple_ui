import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ShareButtonDirective } from 'ngx-sharebuttons';
import { of } from 'rxjs';

import { InfoModalComponent } from '@app/components/shared/info-modal/info-modal.component';
import { UserCategoriesModalComponent } from '@app/routes/main/components/feed/user-categories-modal/user-categories-modal.component';
import { FeedsFooterComponent } from '@app/routes/main/components/shared/feeds-footer/feeds-footer.component';
import { LabelVoteModalComponent } from '@app/routes/main/components/shared/label-vote-modal/label-vote-modal.component';
import { ShareModalComponent } from '@app/routes/main/components/shared/share-modal/share-modal.component';
import { ExposedFeedsModalComponent } from '@app/routes/main/components/shared/vertical-nav/exposed-feeds-modal/exposed-feeds-modal.component';
import { OPMLModalComponent } from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';
import { SubscribeModalComponent } from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import { VerticalNavComponent } from '@app/routes/main/components/shared/vertical-nav/vertical-nav.component';
import { InfiniteScrollDirective } from '@app/routes/main/directives/infinite-scroll.directive';
import {
  FeedEntryVoteService,
  FeedObservableService,
  ReadCounterService,
  UserCategoryObservableService,
} from '@app/routes/main/services';
import {
  ClassifierLabelService,
  FeedEntryService,
  FeedService,
  OPMLService,
  ProgressService,
  UserCategoryService,
} from '@app/services/data';

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
  const mockClassifierLabelService =
    jasmine.createSpyObj<ClassifierLabelService>('ClassifierLabelService', [
      'getAll',
    ]);
  const mockFeedEntryVoteService = jasmine.createSpyObj<FeedEntryVoteService>(
    'FeedEntryVoteService',
    ['shouldForceLabelVote'],
  );

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      ShareButtonDirective,
      RouterModule.forRoot([]),
    ],
    declarations: [
      FeedComponent,
      VerticalNavComponent,
      SubscribeModalComponent,
      OPMLModalComponent,
      ExposedFeedsModalComponent,
      LabelVoteModalComponent,
      InfoModalComponent,
      UserCategoriesModalComponent,
      FeedsFooterComponent,
      InfiniteScrollDirective,
      ShareModalComponent,
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
      {
        provide: ClassifierLabelService,
        useValue: mockClassifierLabelService,
      },
      {
        provide: FeedEntryVoteService,
        useValue: mockFeedEntryVoteService,
      },
    ],
  }).compileComponents();

  return {
    mockFeedService,
    mockUserCategoryService,
    mockFeedEntryService,
    mockOPMLService,
    mockProgressService,
    mockClassifierLabelService,
    mockFeedEntryVoteService,
  };
}

describe('FeedComponent', () => {
  it('should create the component', waitForAsync(async () => {
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
  }));

  // TODO more tests
});
