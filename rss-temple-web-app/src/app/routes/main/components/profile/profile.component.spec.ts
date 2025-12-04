import { provideHttpClient } from '@angular/common/http';
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

import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { DeleteUserConfirm1ModalComponent } from '@app/routes/main/components/profile/delete-user-confirm1-modal/delete-user-confirm1-modal.component';
import { DeleteUserConfirm2ModalComponent } from '@app/routes/main/components/profile/delete-user-confirm2-modal/delete-user-confirm2-modal.component';
import { GlobalUserCategoriesModalComponent } from '@app/routes/main/components/profile/global-user-categories-modal/global-user-categories-modal.component';
import { ReadCounterService } from '@app/routes/main/services';
import { ConfigService, FBAuthService, GAuthService } from '@app/services';
import {
  AuthService,
  FeedService,
  OPMLService,
  SocialService,
  UserCategoryService,
  UserMetaService,
} from '@app/services/data';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';
import { MockFBAuthService } from '@app/test/fbauth.service.mock';
import { MockGAuthService } from '@app/test/gauth.service.mock';

import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        RouterModule.forRoot([]),
        ProfileComponent,
        GlobalUserCategoriesModalComponent,
        DeleteUserConfirm1ModalComponent,
        DeleteUserConfirm2ModalComponent,
        PasswordsMatchValidatorDirective,
      ],
      providers: [
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: {
            resetPassword: vi.fn().mockName('AuthService.resetPassword'),
            getUser: vi.fn().mockName('AuthService.getUser'),
          },
        },
        {
          provide: ReadCounterService,
          useValue: {
            readAll: vi.fn().mockName('ReadCounterService.readAll'),
            feedCounts$: of({}),
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
            download: vi.fn().mockName('OPMLService.download'),
          },
        },
        {
          provide: SocialService,
          useValue: {
            socialList: vi.fn().mockName('SocialService.socialList'),
            googleConnect: vi.fn().mockName('SocialService.googleConnect'),
            googleDisconnect: vi
              .fn()
              .mockName('SocialService.googleDisconnect'),
            facebookConnect: vi.fn().mockName('SocialService.facebookConnect'),
            facebookDisconnect: vi
              .fn()
              .mockName('SocialService.facebookDisconnect'),
          },
        },
        {
          provide: FeedService,
          useValue: {
            query: vi.fn().mockName('FeedService.query'),
          },
        },
        {
          provide: UserMetaService,
          useValue: {
            getReadCount: vi.fn().mockName('UserMetaService.getReadCount'),
          },
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
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
            googleClientId: '',
            facebookAppId: '',
          },
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
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
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as MockedObject<SocialService>;
    mockSocialService.socialList.mockReturnValue(of([]));
    const mockFeedService = TestBed.inject(
      FeedService,
    ) as MockedObject<FeedService>;
    mockFeedService.query.mockReturnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );
    const mockUserMetaService = TestBed.inject(
      UserMetaService,
    ) as MockedObject<UserMetaService>;
    mockUserMetaService.getReadCount.mockReturnValue(of(200));

    const componentFixture = TestBed.createComponent(ProfileComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
