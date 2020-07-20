import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { FeedService, UserCategoryService } from '@app/services/data';
import { FeedObservableService } from '@app/routes/main/services';

import { HeaderComponent } from './header.component';
import { LoginService } from '@app/services';

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

  await TestBed.configureTestingModule({
    imports: [
      NgbDropdownModule,

      SnackbarModule.forRoot(),

      RouterTestingModule.withRoutes([]),
    ],
    declarations: [HeaderComponent],
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
    ],
  }).compileComponents();

  return {
    mockFeedService,
    mockUserCategoryService,
    mockLoginService,
  };
}

describe('HeaderComponent', () => {
  it('should create the component', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(HeaderComponent);
    const component = componentFixture.debugElement
      .componentInstance as HeaderComponent;
    expect(component).toBeTruthy();
  }));

  // TODO more tests
});
