import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { ShareButtonDirective } from 'ngx-sharebuttons';
import { of } from 'rxjs';
import {
  type MockedObject,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { InfoModalComponent } from '@app/components/shared/info-modal/info-modal.component';
import { ReportFeedModalComponent } from '@app/routes/main/components/feed/report-feed-modal/report-feed-modal.component';
import { UserCategoriesModalComponent } from '@app/routes/main/components/feed/user-categories-modal/user-categories-modal.component';
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
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { FeedComponent } from './feed.component';

describe('FeedComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserModule,
        ClarityModule,
        ShareButtonDirective,
        RouterModule.forRoot([]),
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
        LemmyShareModalComponent,
        MastodonShareModalComponent,
        ReportFeedEntryModalComponent,
        ReportFeedModalComponent,
      ],
      providers: [
        provideHttpClient(),
        FeedObservableService,
        UserCategoryObservableService,
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
          },
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
        {
          provide: FeedService,
          useValue: {
            queryAll: vi.fn().mockName('FeedService.queryAll'),
          },
        },
        {
          provide: UserCategoryService,
          useValue: {
            queryAll: vi.fn().mockName('UserCategoryService.queryAll'),
            apply: vi.fn().mockName('UserCategoryService.apply'),
          },
        },
        {
          provide: ReadCounterService,
          useValue: {
            readAll: vi.fn().mockName('ReadCounterService.readAll'),
          },
        },
        {
          provide: FeedEntryService,
          useValue: {
            query: vi.fn().mockName('FeedEntryService.query'),
            readSome: vi.fn().mockName('FeedEntryService.readSome'),
            unreadSome: vi.fn().mockName('FeedEntryService.unreadSome'),
          },
        },
        {
          provide: OPMLService,
          useValue: {
            upload: vi.fn().mockName('OPMLService.upload'),
          },
        },
        {
          provide: ProgressService,
          useValue: {
            checkProgress: vi.fn().mockName('ProgressService.checkProgress'),
          },
        },
        {
          provide: ClassifierLabelService,
          useValue: {
            getAll: vi.fn().mockName('ClassifierLabelService.getAll'),
          },
        },
        {
          provide: FeedEntryVoteService,
          useValue: {
            shouldForceLabelVote: vi
              .fn()
              .mockName('FeedEntryVoteService.shouldForceLabelVote'),
          },
        },
        {
          provide: SubscribedFeedsFacadeService,
          useValue: {
            feeds$: of([]),
          },
        },
        {
          provide: ReportService,
          useValue: {
            reportFeed: vi.fn().mockName('ReportService.reportFeed'),
            reportFeedEntry: vi.fn().mockName('ReportService.reportFeedEntry'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const mockUserCategoryService = TestBed.inject(
      UserCategoryService,
    ) as MockedObject<UserCategoryService>;
    mockUserCategoryService.queryAll.mockReturnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );
    const mockFeedService = TestBed.inject(
      FeedService,
    ) as MockedObject<FeedService>;
    mockFeedService.queryAll.mockReturnValue(
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
  });

  // TODO more tests
});
