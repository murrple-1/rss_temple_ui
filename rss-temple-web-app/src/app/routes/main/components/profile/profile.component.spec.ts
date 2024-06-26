import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { of } from 'rxjs';

import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { DeleteUserConfirm1ModalComponent } from '@app/routes/main/components/profile/delete-user-confirm1-modal/delete-user-confirm1-modal.component';
import { DeleteUserConfirm2ModalComponent } from '@app/routes/main/components/profile/delete-user-confirm2-modal/delete-user-confirm2-modal.component';
import { GlobalUserCategoriesModalComponent } from '@app/routes/main/components/profile/global-user-categories-modal/global-user-categories-modal.component';
import { ReadCounterService } from '@app/routes/main/services';
import { FBAuthService, GAuthService } from '@app/services';
import { ConfigService } from '@app/services';
import {
  AuthService,
  FeedService,
  OPMLService,
  SocialService,
  UserCategoryService,
  UserMetaService,
} from '@app/services/data';
import { MockConfigService } from '@app/test/config.service.mock';
import { MockFBAuthService } from '@app/test/fbauth.service.mock';
import { MockGAuthService } from '@app/test/gauth.service.mock';

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
  const mockUserMetaService = jasmine.createSpyObj<UserMetaService>(
    'UserMetaService',
    ['getReadCount'],
  );
  const mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', [
    'resetPassword',
    'getUser',
  ]);
  const mockSocialService = jasmine.createSpyObj<SocialService>(
    'SocialService',
    [
      'socialList',
      'googleConnect',
      'googleDisconnect',
      'facebookConnect',
      'facebookDisconnect',
    ],
  );
  const mockOPMLService = jasmine.createSpyObj<OPMLService>('OPMLService', [
    'download',
  ]);
  const mockUserCategoryService = jasmine.createSpyObj<UserCategoryService>(
    'UserCategoryService',
    ['queryAll'],
  );
  const mockConfigService = new MockConfigService({
    apiHost: '',
    googleClientId: '',
    facebookAppId: '',
  });

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterModule.forRoot([]),
    ],
    declarations: [
      ProfileComponent,
      GlobalUserCategoriesModalComponent,
      DeleteUserConfirm1ModalComponent,
      DeleteUserConfirm2ModalComponent,
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
        provide: AuthService,
        useValue: mockAuthService,
      },
      {
        provide: SocialService,
        useValue: mockSocialService,
      },
      {
        provide: FeedService,
        useValue: mockFeedService,
      },
      {
        provide: UserMetaService,
        useValue: mockUserMetaService,
      },
      {
        provide: OPMLService,
        useValue: mockOPMLService,
      },
      {
        provide: UserCategoryService,
        useValue: mockUserCategoryService,
      },
      {
        provide: ConfigService,
        useValue: mockConfigService,
      },
    ],
  }).compileComponents();

  return {
    mockReadCounterService,
    mockFeedService,
    mockUserMetaService,
    mockAuthService,
    mockSocialService,
    mockConfigService,
  };
}

describe('ProfileComponent', () => {
  it('should create the component', waitForAsync(async () => {
    const {
      mockAuthService,
      mockSocialService,
      mockFeedService,
      mockUserMetaService,
    } = await setup();
    mockAuthService.getUser.and.returnValue(
      of({
        uuid: '772893c2-c78f-42d8-82a7-5d56a1837a28',
        email: 'test@test.com',
        subscribedFeedUuids: [],
        attributes: {},
      }),
    );
    mockSocialService.socialList.and.returnValue(of([]));
    mockFeedService.query.and.returnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );
    mockUserMetaService.getReadCount.and.returnValue(of(200));

    const componentFixture = TestBed.createComponent(ProfileComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
