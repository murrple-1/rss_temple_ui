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
  LoginService,
} from '@app/services/data';
import { FeedObservableService } from '@app/routes/main/services';
import { SubscribeModalComponent } from '@app/routes/main/components/shared/header/subscribe-modal/subscribe-modal.component';
import { OPMLModalComponent } from '@app/routes/main/components/shared/header/opml-modal/opml-modal.component';

import { HeaderComponent } from './header.component';

async function setup() {
  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'queryAll',
    'get',
    'subscribe',
  ]);
  const mockUserCategoryService = jasmine.createSpyObj<UserCategoryService>(
    'UserCategoryService',
    ['queryAll'],
  );
  const mockLoginService = jasmine.createSpyObj<LoginService>('LoginService', [
    'deleteSessionToken',
  ]);
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
      HeaderComponent,
      SubscribeModalComponent,
      OPMLModalComponent,
    ],
    providers: [
      FeedObservableService,
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
    mockLoginService,
    mockOPMLService,
  };
}

describe('HeaderComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(HeaderComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'can run ngOnInit',
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

      const componentFixture = TestBed.createComponent(HeaderComponent);
      const component = componentFixture.componentInstance;

      component.ngOnInit();

      expect().nothing();
    }),
  );

  // TODO more tests
});
