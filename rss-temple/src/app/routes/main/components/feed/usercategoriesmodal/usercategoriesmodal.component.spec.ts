import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { UserCategoryService } from '@app/services/data';
import { Objects } from '@app/services/data/objects';
import { UserCategory } from '@app/models';

import { UserCategoriesModalComponent } from './usercategoriesmodal.component';

async function setup() {
  const mockActiveModal = jasmine.createSpyObj<NgbActiveModal>(
    'NgbActiveModal',
    ['close'],
  );

  const mockUserCategoryService = jasmine.createSpyObj<UserCategoryService>(
    'UserCategoryService',
    ['queryAll', 'create', 'delete'],
  );

  await TestBed.configureTestingModule({
    imports: [SnackbarModule.forRoot(), RouterTestingModule.withRoutes([])],
    declarations: [UserCategoriesModalComponent],
    providers: [
      {
        provide: NgbActiveModal,
        useValue: mockActiveModal,
      },
      {
        provide: UserCategoryService,
        useValue: mockUserCategoryService,
      },
    ],
  }).compileComponents();

  return {
    mockActiveModal,

    mockUserCategoryService,
  };
}

describe('UserCategoriesModalComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(
        UserCategoriesModalComponent,
      );
      const component = componentFixture.debugElement
        .componentInstance as UserCategoriesModalComponent;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'can run ngOnInit',
    waitForAsync(async () => {
      const { mockUserCategoryService } = await setup();
      mockUserCategoryService.queryAll.and.returnValue(
        of<Objects<UserCategory>>({
          objects: [],
          totalCount: 0,
        }),
      );

      const componentFixture = TestBed.createComponent(
        UserCategoriesModalComponent,
      );
      const component = componentFixture.debugElement
        .componentInstance as UserCategoriesModalComponent;

      component.ngOnInit();
      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  // TODO more tests
});
