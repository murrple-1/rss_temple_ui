import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { HeaderComponent } from '@app/routes/main/components/shared/header/header.component';
import { OPMLModalComponent } from '@app/routes/main/components/shared/header/opml-modal/opml-modal.component';
import { SubscribeModalComponent } from '@app/routes/main/components/shared/header/subscribe-modal/subscribe-modal.component';
import {
  FeedService,
  OPMLService,
  ProgressService,
  UserCategoryService,
} from '@app/services/data';
import { FeedObservableService } from '@app/routes/main/services';
import { LoginService } from '@app/services';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  beforeEach(() => {
    const mockOPMLService = jasmine.createSpyObj<OPMLService>('OPMLService', [
      'upload',
    ]);
    const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
      'get',
    ]);
    const mockUserCategoryService = jasmine.createSpyObj<UserCategoryService>(
      'UserCategoryService',
      ['get'],
    );
    const mockLoginService = jasmine.createSpyObj<LoginService>(
      'LoginService',
      ['createMyLogin'],
    );
    const mockProgressService = jasmine.createSpyObj<ProgressService>(
      'ProgressService',
      ['checkProgress'],
    );

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ClarityModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        MainComponent,
        HeaderComponent,
        OPMLModalComponent,
        SubscribeModalComponent,
      ],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },

        {
          provide: OPMLService,
          useValue: mockOPMLService,
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
          provide: LoginService,
          useValue: mockLoginService,
        },
        {
          provide: ProgressService,
          useValue: mockProgressService,
        },
        FeedObservableService,
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const componentFixture = TestBed.createComponent(MainComponent);
    const component = componentFixture.debugElement
      .componentInstance as MainComponent;
    expect(component).toBeTruthy();
  });

  it('handles collapsed events', () => {
    const componentFixture = TestBed.createComponent(MainComponent);
    const component = componentFixture.debugElement
      .componentInstance as MainComponent;

    expect(component.collapedSideBar).toBeFalse();

    component.receiveCollapsed(false);
    expect(component.collapedSideBar).toBeFalse();

    component.receiveCollapsed(true);
    expect(component.collapedSideBar).toBeTrue();
  });
});
