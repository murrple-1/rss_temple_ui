import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { FeedService, UserCategoryService } from '@app/services/data';
import { FeedObservableService } from '@app/routes/main/services';
import { LoginService } from '@app/services';

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

  it('can run ngOnInit', async(async () => {
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
    const component = componentFixture.debugElement
      .componentInstance as HeaderComponent;

    component.ngOnInit();
    await componentFixture.whenStable();
    expect().nothing();
  }));

  // TODO more tests
});
