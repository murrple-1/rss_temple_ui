import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { of } from 'rxjs';

import { ReadCounterService } from '@app/routes/main/services';
import { AuthService, ExploreService, FeedService } from '@app/services/data';

import { ExploreComponent } from './explore.component';

describe('ExploreComponent', () => {
  beforeEach(async () => {
    const mockReadCounterService = jasmine.createSpyObj<ReadCounterService>(
      'ReadCounterService',
      ['readAll'],
    );
    (mockReadCounterService as any).feedCounts$ = of({});

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        ClarityModule,
        RouterModule.forRoot([]),
        ExploreComponent,
      ],
      providers: [
        {
          provide: FeedService,
          useValue: jasmine.createSpyObj<FeedService>('FeedService', ['query']),
        },
        {
          provide: ExploreService,
          useValue: jasmine.createSpyObj<ExploreService>('ExploreService', [
            'explore',
          ]),
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj<AuthService>('AuthService', [
            'getUser',
          ]),
        },
      ],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as jasmine.SpyObj<AuthService>;
    mockAuthService.getUser.and.returnValue(
      of({
        uuid: '772893c2-c78f-42d8-82a7-5d56a1837a28',
        email: 'test@test.com',
        subscribedFeedUuids: [],
        attributes: {},
      }),
    );
    const mockFeedService = TestBed.inject(
      FeedService,
    ) as jasmine.SpyObj<FeedService>;
    mockFeedService.query.and.returnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );
    const mockExploreService = TestBed.inject(
      ExploreService,
    ) as jasmine.SpyObj<ExploreService>;
    mockExploreService.explore.and.returnValue(of([]));

    const componentFixture = TestBed.createComponent(ExploreComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
