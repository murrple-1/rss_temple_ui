import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { of } from 'rxjs';

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
          useValue: jasmine.createSpyObj<ReadCounterService>(
            'ReadCounterService',
            ['readAll'],
          ),
        },
        {
          provide: FeedService,
          useValue: jasmine.createSpyObj<FeedService>('FeedService', [
            'queryAll',
            'get',
            'subscribe',
          ]),
        },
        {
          provide: UserCategoryService,
          useValue: jasmine.createSpyObj<UserCategoryService>(
            'UserCategoryService',
            ['queryAll'],
          ),
        },
        {
          provide: OPMLService,
          useValue: jasmine.createSpyObj<OPMLService>('OPMLService', [
            'upload',
          ]),
        },
        {
          provide: ProgressService,
          useValue: jasmine.createSpyObj<ProgressService>('ProgressService', [
            'checkProgress',
          ]),
        },
        {
          provide: SubscribedFeedsFacadeService,
          useValue: jasmine.createSpyObj<SubscribedFeedsFacadeService>(
            'SubscribedFeedsFacadeService',
            {},
            { feeds$: of([]) },
          ),
        },
      ],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const mockUserCategoryService = TestBed.inject(
      UserCategoryService,
    ) as jasmine.SpyObj<UserCategoryService>;
    mockUserCategoryService.queryAll.and.returnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );
    const mockFeedService = TestBed.inject(
      FeedService,
    ) as jasmine.SpyObj<FeedService>;
    mockFeedService.queryAll.and.returnValue(
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
  }));

  // TODO more tests
});
