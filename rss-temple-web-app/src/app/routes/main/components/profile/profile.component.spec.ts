import { provideHttpClient } from '@angular/common/http';
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
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj<AuthService>('AuthService', [
            'resetPassword',
            'getUser',
          ]),
        },
        {
          provide: ReadCounterService,
          useValue: jasmine.createSpyObj<ReadCounterService>(
            'ReadCounterService',
            ['readAll'],
            {
              feedCounts$: of({}),
            },
          ),
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
            'download',
          ]),
        },
        {
          provide: SocialService,
          useValue: jasmine.createSpyObj<SocialService>('SocialService', [
            'socialList',
            'googleConnect',
            'googleDisconnect',
            'facebookConnect',
            'facebookDisconnect',
          ]),
        },
        {
          provide: FeedService,
          useValue: jasmine.createSpyObj<FeedService>('FeedService', ['query']),
        },
        {
          provide: UserMetaService,
          useValue: jasmine.createSpyObj<UserMetaService>('UserMetaService', [
            'getReadCount',
          ]),
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
    const mockSocialService = TestBed.inject(
      SocialService,
    ) as jasmine.SpyObj<SocialService>;
    mockSocialService.socialList.and.returnValue(of([]));
    const mockFeedService = TestBed.inject(
      FeedService,
    ) as jasmine.SpyObj<FeedService>;
    mockFeedService.query.and.returnValue(
      of({
        objects: [],
        totalCount: 0,
      }),
    );
    const mockUserMetaService = TestBed.inject(
      UserMetaService,
    ) as jasmine.SpyObj<UserMetaService>;
    mockUserMetaService.getReadCount.and.returnValue(of(200));

    const componentFixture = TestBed.createComponent(ProfileComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
