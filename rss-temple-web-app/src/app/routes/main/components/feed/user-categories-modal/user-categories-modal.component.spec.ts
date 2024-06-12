import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';

import { UserCategoryService } from '@app/services/data';

import { UserCategoriesModalComponent } from './user-categories-modal.component';

async function setup() {
  const mockUserCategoryService = jasmine.createSpyObj<UserCategoryService>(
    'UserCategoryService',
    ['queryAll', 'create'],
  );

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterModule.forRoot([]),
    ],
    declarations: [UserCategoriesModalComponent],
    providers: [
      {
        provide: UserCategoryService,
        useValue: mockUserCategoryService,
      },
    ],
  }).compileComponents();

  return {
    mockUserCategoryService,
  };
}

describe('UserCategoriesModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(
      UserCategoriesModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
