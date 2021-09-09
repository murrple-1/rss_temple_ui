import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { ClarityModule } from '@clr/angular';

import { of } from 'rxjs';

import {
  FeedService,
  OPMLService,
  ProgressService,
  UserCategoryService,
} from '@app/services/data';
import {
  ReadCounterService,
  FeedObservableService,
  UserCategoryObservableService,
} from '@app/routes/main/services';
import { SubscribeModalComponent } from '@app/routes/main/components/shared/vertical-nav/subscribe-modal/subscribe-modal.component';
import { OPMLModalComponent } from '@app/routes/main/components/shared/vertical-nav/opml-modal/opml-modal.component';

import { VerticalNavComponent } from './vertical-nav.component';

async function setup() {
  const mockReadCounterService = jasmine.createSpyObj<ReadCounterService>(
    'ReadCounterService',
    ['readAll'],
  );
  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'queryAll',
    'get',
    'subscribe',
  ]);
  const mockUserCategoryService = jasmine.createSpyObj<UserCategoryService>(
    'UserCategoryService',
    ['queryAll'],
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
      VerticalNavComponent,
      SubscribeModalComponent,
      OPMLModalComponent,
    ],
    providers: [
      FeedObservableService,
      UserCategoryObservableService,
      {
        provide: ReadCounterService,
        useValue: mockReadCounterService,
      },
      {
        provide: FeedService,
        useValue: mockFeedService,
      },
      {
        provide: UserCategoryService,
        useValue: mockUserCategoryService,
      },
      {
        provide: OPMLService,
        useValue: mockOPMLService,
      },
      {
        provide: ProgressService,
        useValue: mockProgressService,
      },
    ],
  }).compileComponents();

  return {
    mockFeedService,
    mockUserCategoryService,
    mockOPMLService,
  };
}

describe('VerticalNavComponent', () => {
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

      const componentFixture = TestBed.createComponent(VerticalNavComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
      componentFixture.detectChanges();
      await componentFixture.whenStable();
    }),
  );

  // TODO more tests
});
