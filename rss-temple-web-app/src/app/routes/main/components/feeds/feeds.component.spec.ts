import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ShareButtonDirective } from 'ngx-sharebuttons';
import { of } from 'rxjs';

import { InfoModalComponent } from '@app/components/shared/info-modal/info-modal.component';
import { ReportFeedModalComponent } from '@app/routes/main/components/feed/report-feed-modal/report-feed-modal.component';
import { ReportFeedEntryModalComponent } from '@app/routes/main/components/shared/feed-entry-view/report-feed-entry-modal/report-feed-entry-modal.component';
import { FeedsFooterComponent } from '@app/routes/main/components/shared/feeds-footer/feeds-footer.component';
import { LabelVoteModalComponent } from '@app/routes/main/components/shared/label-vote-modal/label-vote-modal.component';
import { LemmyShareModalComponent } from '@app/routes/main/components/shared/share-modal/lemmy-share-modal/lemmy-share-modal.component';
import { MastodonShareModalComponent } from '@app/routes/main/components/shared/share-modal/mastodon-share-modal/mastodon-share-modal.component';
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
  SubscribedFeedsFacadeService,
  UserCategoryObservableService,
} from '@app/routes/main/services';
import { ConfigService } from '@app/services';
import {
  ClassifierLabelService,
  FeedEntryService,
  FeedService,
  OPMLService,
  ProgressService,
  ReportService,
  UserCategoryService,
} from '@app/services/data';
import { MockActivatedRoute } from '@app/test/activatedroute.mock';
import { MockConfigService } from '@app/test/config.service.mock';

import { FeedsComponent } from './feeds.component';

async function setup() {
  const mockRoute = new MockActivatedRoute();
  const mockConfigService = new MockConfigService({});

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
  const mockClassifierLabelService =
    jasmine.createSpyObj<ClassifierLabelService>('ClassifierLabelService', [
      'getAll',
    ]);
  const mockFeedEntryVoteService = jasmine.createSpyObj<FeedEntryVoteService>(
    'FeedEntryVoteService',
    ['shouldForceLabelVote'],
  );
  const mockSubscribedFeedsFacadeService =
    jasmine.createSpyObj<SubscribedFeedsFacadeService>(
      'SubscribedFeedsFacadeService',
      {},
      { feeds$: of([]) },
    );
  const mockReportService = jasmine.createSpyObj<ReportService>(
    'ReportService',
    ['reportFeed', 'reportFeedEntry'],
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
      FeedsComponent,
      VerticalNavComponent,
      SubscribeModalComponent,
      OPMLModalComponent,
      ExposedFeedsModalComponent,
      InfoModalComponent,
      LabelVoteModalComponent,
      FeedsFooterComponent,
      InfiniteScrollDirective,
      ShareModalComponent,
      LemmyShareModalComponent,
      MastodonShareModalComponent,
      ReportFeedEntryModalComponent,
      ReportFeedModalComponent,
    ],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: mockRoute,
      },
      {
        provide: ConfigService,
        useValue: mockConfigService,
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
        provide: ClassifierLabelService,
        useValue: mockClassifierLabelService,
      },
      {
        provide: ReadCounterService,
        useValue: mockReadCounterService,
      },
      {
        provide: FeedEntryVoteService,
        useValue: mockFeedEntryVoteService,
      },
      {
        provide: SubscribedFeedsFacadeService,
        useValue: mockSubscribedFeedsFacadeService,
      },
      {
        provide: ReportService,
        useValue: mockReportService,
      },
    ],
  }).compileComponents();

  return {
    mockRoute,
    mockConfigService,

    mockFeedEntryService,
    mockFeedService,
    mockOPMLService,
    mockProgressService,
    mockUserCategoryService,
    mockClassifierLabelService,
    mockReadCounterService,
    mockFeedEntryVoteService,
    mockSubscribedFeedsFacadeService,
  };
}

describe('FeedsComponent', () => {
  it('should create the component', waitForAsync(async () => {
    const { mockUserCategoryService } = await setup();
    mockUserCategoryService.queryAll.and.returnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );

    const componentFixture = TestBed.createComponent(FeedsComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
