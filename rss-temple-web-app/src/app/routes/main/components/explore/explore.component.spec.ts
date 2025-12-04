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

import { ReadCounterService } from '@app/routes/main/services';
import { AuthService, ExploreService, FeedService } from '@app/services/data';

import { ExploreComponent } from './explore.component';

describe('ExploreComponent', () => {
  beforeEach(async () => {
    const mockReadCounterService = {
      readAll: vi.fn().mockName('ReadCounterService.readAll'),
    };
    (mockReadCounterService as any).feedCounts$ = of({});

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        RouterModule.forRoot([]),
        ExploreComponent,
      ],
      providers: [
        {
          provide: FeedService,
          useValue: {
            query: vi.fn().mockName('FeedService.query'),
          },
        },
        {
          provide: ExploreService,
          useValue: {
            explore: vi.fn().mockName('ExploreService.explore'),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getUser: vi.fn().mockName('AuthService.getUser'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as MockedObject<AuthService>;
    mockAuthService.getUser.mockReturnValue(
      of({
        uuid: '772893c2-c78f-42d8-82a7-5d56a1837a28',
        email: 'test@test.com',
        subscribedFeedUuids: [],
        attributes: {},
      }),
    );
    const mockFeedService = TestBed.inject(
      FeedService,
    ) as MockedObject<FeedService>;
    mockFeedService.query.mockReturnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );
    const mockExploreService = TestBed.inject(
      ExploreService,
    ) as MockedObject<ExploreService>;
    mockExploreService.explore.mockReturnValue(of([]));

    const componentFixture = TestBed.createComponent(ExploreComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
