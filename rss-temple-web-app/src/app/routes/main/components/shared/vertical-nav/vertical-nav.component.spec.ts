import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
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
import { ExposedFeedsModalComponent } from '@app/routes/main/components/shared/vertical-nav/exposed-feeds-modal/exposed-feeds-modal.component';
import { OPMLModalComponent } from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';
import { SubscribeModalComponent } from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import {
  FeedObservableService,
  ReadCounterService,
  SubscribedFeedsFacadeService,
  UserCategoryObservableService,
} from '@app/routes/main/services';
import {
  FeedService,
  OPMLService,
  ProgressService,
  UserCategoryService,
} from '@app/services/data';

import { VerticalNavComponent } from './vertical-nav.component';

describe('VerticalNavComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        RouterModule.forRoot([]),
        VerticalNavComponent,
        SubscribeModalComponent,
        OPMLModalComponent,
        ExposedFeedsModalComponent,
        InfoModalComponent,
      ],
      providers: [
        FeedObservableService,
        UserCategoryObservableService,
        {
          provide: ReadCounterService,
          useValue: {
            readAll: vi.fn().mockName('ReadCounterService.readAll'),
          },
        },
        {
          provide: FeedService,
          useValue: {
            queryAll: vi.fn().mockName('FeedService.queryAll'),
            get: vi.fn().mockName('FeedService.get'),
            subscribe: vi.fn().mockName('FeedService.subscribe'),
          },
        },
        {
          provide: UserCategoryService,
          useValue: {
            queryAll: vi.fn().mockName('UserCategoryService.queryAll'),
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
          provide: SubscribedFeedsFacadeService,
          useValue: {
            feeds$: of([]),
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

    const componentFixture = TestBed.createComponent(VerticalNavComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
