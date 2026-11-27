import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { FeedsComponent } from './feeds.component';

describe('FeedsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        ShareButtonDirective,
        RouterModule.forRoot([]),
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
        provideHttpClient(),
        FeedObservableService,
        UserCategoryObservableService,
        {
          provide: ActivatedRoute,
          useClass: MockActivatedRoute,
        },
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
            onboardingYoutubeEmbededUrl: '',
          },
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
        {
          provide: UserCategoryService,
          useValue: {
            queryAll: vi.fn().mockName('UserCategoryService.queryAll'),
          },
        },
        {
          provide: ReportService,
          useValue: {
            reportFeed: vi.fn().mockName('ReportService.reportFeed'),
            reportFeedEntry: vi.fn().mockName('ReportService.reportFeedEntry'),
          },
        },
        {
          provide: SubscribedFeedsFacadeService,
          useValue: {
            feeds$: of([]),
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
          provide: ClassifierLabelService,
          useValue: {
            getAll: vi.fn().mockName('ClassifierLabelService.getAll'),
          },
        },
        {
          provide: ProgressService,
          useValue: {
            checkProgress: vi.fn().mockName('ProgressService.checkProgress'),
          },
        },
        {
          provide: OPMLService,
          useValue: {
            upload: vi.fn().mockName('OPMLService.upload'),
          },
        },
        {
          provide: FeedService,
          useValue: {
            queryAll: vi.fn().mockName('FeedService.queryAll'),
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
          provide: ReadCounterService,
          useValue: {
            readAll: vi.fn().mockName('ReadCounterService.readAll'),
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

    const componentFixture = TestBed.createComponent(FeedsComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  it('should render the jump spacer last in the scroll container', async () => {
    const mockUserCategoryService = TestBed.inject(
      UserCategoryService,
    ) as MockedObject<UserCategoryService>;
    mockUserCategoryService.queryAll.mockReturnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );

    const componentFixture = TestBed.createComponent(FeedsComponent);
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const contentArea = (
      componentFixture.nativeElement as HTMLElement
    ).querySelector('.content-area');
    expect(
      contentArea?.lastElementChild?.classList.contains('app--jump-spacer'),
    ).toBe(true);
  });

  function setup(entryTops: number[]) {
    const mockUserCategoryService = TestBed.inject(
      UserCategoryService,
    ) as MockedObject<UserCategoryService>;
    mockUserCategoryService.queryAll.mockReturnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );

    const componentFixture = TestBed.createComponent(FeedsComponent);
    const component = componentFixture.componentInstance;
    componentFixture.detectChanges();

    const container = (
      component as unknown as {
        feedEntryViewsScollContainer: { nativeElement: HTMLElement };
      }
    ).feedEntryViewsScollContainer.nativeElement;
    // container: top 100, height 600
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 100, 800, 600),
    );
    container.scrollTo = vi.fn((options: ScrollToOptions) => {
      container.scrollTop = options.top ?? 0;
    }) as unknown as typeof container.scrollTo;

    const views = entryTops.map(top => ({
      autoRead: vi.fn(),
      feedEntry: undefined,
      elementRef: {
        nativeElement: {
          getBoundingClientRect: () => new DOMRect(0, top, 800, 50),
        },
      },
    }));
    (component as unknown as { feedEntryViews: unknown }).feedEntryViews = {
      toArray: () => views,
    };

    const press = (key: string) =>
      component.handleKeyPress(new KeyboardEvent('keypress', { key }));

    return { component, container, views, press };
  }

  it('should top-align on "j" even when the entry is fully visible', () => {
    const { component, container, views, press } = setup([300, 360, 420]);
    component.focusedFeedEntryView = views[0] as never;
    press('j');
    expect(component.focusedFeedEntryView).toBe(views[1]);
    expect(views[1]?.autoRead).toHaveBeenCalled();
    // 360 + 0 - 100 - 8
    expect(container.scrollTo).toHaveBeenCalledWith({ top: 252 });
  });

  it('should top-align on "k"', () => {
    const { component, container, views, press } = setup([300, 360, 420]);
    component.focusedFeedEntryView = views[2] as never;
    press('k');
    expect(component.focusedFeedEntryView).toBe(views[1]);
    expect(container.scrollTo).toHaveBeenCalledWith({ top: 252 });
  });

  it('should not scroll to a negative position', () => {
    const { container, press } = setup([104, 164]);
    press('j'); // no focus yet -> index 0; 104 + 0 - 100 - 8 = -4
    expect(container.scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it('should ignore viewport events at the jump position', () => {
    const { component, views, press } = setup([300, 360, 420]);
    component.focusedFeedEntryView = views[0] as never;
    press('j');
    component.onEntryEnteredViewport(
      { isInViewport: true } as never,
      views[2] as never,
    );
    expect(component.focusedFeedEntryView).toBe(views[1]);
    expect(views[2]?.autoRead).not.toHaveBeenCalled();
  });

  it('should honour viewport events after a manual scroll', () => {
    const { component, container, views, press } = setup([300, 360, 420]);
    component.focusedFeedEntryView = views[0] as never;
    press('j');
    container.scrollTop += 40;
    component.onEntryEnteredViewport(
      { isInViewport: true } as never,
      views[2] as never,
    );
    expect(component.focusedFeedEntryView).toBe(views[2]);
    expect(views[2]?.autoRead).toHaveBeenCalled();
    // and it stays honoured if the reader scrolls back to the jump position
    container.scrollTop -= 40;
    component.onEntryEnteredViewport(
      { isInViewport: true } as never,
      views[0] as never,
    );
    expect(component.focusedFeedEntryView).toBe(views[0]);
  });

  it('should honour viewport events after a reload', () => {
    const { component, views, press } = setup([300, 360, 420]);
    component.focusedFeedEntryView = views[0] as never;
    press('j');
    press('r');
    component.onEntryEnteredViewport(
      { isInViewport: true } as never,
      views[2] as never,
    );
    expect(component.focusedFeedEntryView).toBe(views[2]);
  });
});
