import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { UserCategoryService } from '@app/services/data';

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
  it('should create the component', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(
      UserCategoriesModalComponent,
    );
    const component = componentFixture.debugElement
      .componentInstance as UserCategoriesModalComponent;
    expect(component).toBeTruthy();
  }));

  // TODO more tests
});
