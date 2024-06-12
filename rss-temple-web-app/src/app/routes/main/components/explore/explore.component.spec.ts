import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { of } from 'rxjs';

import { ReadCounterService } from '@app/routes/main/services';
import { AuthService, ExploreService, FeedService } from '@app/services/data';

import { ExploreComponent } from './explore.component';

async function setup() {
  const mockReadCounterService = jasmine.createSpyObj<ReadCounterService>(
    'ReadCounterService',
    ['readAll'],
  );
  (mockReadCounterService as any).feedCounts$ = of({});

  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'query',
  ]);
  const mockExploreService = jasmine.createSpyObj<ExploreService>(
    'ExploreService',
    ['explore'],
  );
  const mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', [
    'getUser',
  ]);

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterModule.forRoot([]),
    ],
    declarations: [ExploreComponent],
    providers: [
      {
        provide: FeedService,
        useValue: mockFeedService,
      },
      {
        provide: ExploreService,
        useValue: mockExploreService,
      },
    ],
  }).compileComponents();

  return {
    mockReadCounterService,
    mockFeedService,
    mockExploreService,
    mockAuthService,
  };
}

describe('ExploreComponent', () => {
  it('should create the component', waitForAsync(async () => {
    const { mockAuthService, mockFeedService, mockExploreService } =
      await setup();
    mockAuthService.getUser.and.returnValue(
      of({
        uuid: '772893c2-c78f-42d8-82a7-5d56a1837a28',
        email: 'test@test.com',
        subscribedFeedUuids: [],
        attributes: {},
      }),
    );
    mockFeedService.query.and.returnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );
    mockExploreService.explore.and.returnValue(of([]));

    const componentFixture = TestBed.createComponent(ExploreComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
