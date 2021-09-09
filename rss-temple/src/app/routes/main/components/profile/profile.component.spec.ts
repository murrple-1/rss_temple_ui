import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { of } from 'rxjs';

import { MockGAuthService } from '@app/test/gauth.service.mock';
import { MockFBAuthService } from '@app/test/fbauth.service.mock';
import {
  FeedService,
  FeedEntryService,
  UserService,
  OPMLService,
  UserCategoryService,
} from '@app/services/data';
import { GAuthService, FBAuthService } from '@app/services';
import { ReadCounterService } from '@app/routes/main/services';
import { GlobalUserCategoriesModalComponent } from '@app/routes/main/components/profile/global-user-categories-modal/global-user-categories-modal.component';
import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';

import { ProfileComponent } from './profile.component';

async function setup() {
  const mockReadCounterService = jasmine.createSpyObj<ReadCounterService>(
    'ReadCounterService',
    ['readAll'],
  );
  (mockReadCounterService as any).feedCounts$ = of({});

  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'query',
  ]);
  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query'],
  );
  const mockUserService = jasmine.createSpyObj<UserService>('UserService', [
    'get',
    'update',
  ]);
  const mockOPMLService = jasmine.createSpyObj<OPMLService>('OPMLService', [
    'download',
  ]);
  const mockUserCategoryService = jasmine.createSpyObj<UserCategoryService>(
    'UserCategoryService',
    ['queryAll'],
  );

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [
      ProfileComponent,
      GlobalUserCategoriesModalComponent,
      PasswordsMatchValidatorDirective,
    ],
    providers: [
      {
        provide: ReadCounterService,
        useValue: mockReadCounterService,
      },
      {
        provide: GAuthService,
        useClass: MockGAuthService,
      },
      {
        provide: FBAuthService,
        useClass: MockFBAuthService,
      },
      {
        provide: FeedService,
        useValue: mockFeedService,
      },
      {
        provide: FeedEntryService,
        useValue: mockFeedEntryService,
      },
      {
        provide: UserService,
        useValue: mockUserService,
      },
      {
        provide: OPMLService,
        useValue: mockOPMLService,
      },
      {
        provide: UserCategoryService,
        useValue: mockUserCategoryService,
      },
    ],
  }).compileComponents();

  return {
    mockReadCounterService,
    mockFeedService,
    mockFeedEntryService,
    mockUserService,
  };
}

describe('ProfileComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      const { mockUserService, mockFeedService, mockFeedEntryService } =
        await setup();
      mockUserService.get.and.returnValue(of({}));
      mockFeedService.query.and.returnValue(
        of({
          objects: [],
          totalCount: 0,
        }),
      );
      mockFeedEntryService.query.and.returnValue(
        of({
          objects: [],
          totalCount: 0,
        }),
      );

      const componentFixture = TestBed.createComponent(ProfileComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
      componentFixture.detectChanges();
      await componentFixture.whenStable();
    }),
  );

  // TODO more tests
});
