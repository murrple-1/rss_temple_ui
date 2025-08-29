import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';

import { UserCategoryService } from '@app/services/data';

import { GlobalUserCategoriesModalComponent } from './global-user-categories-modal.component';

describe('GlobalUserCategoriesModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        ClarityModule,
        RouterModule.forRoot([]),
      ],
      declarations: [GlobalUserCategoriesModalComponent],
      providers: [
        {
          provide: UserCategoryService,
          useValue: jasmine.createSpyObj<UserCategoryService>(
            'UserCategoryService',
            ['queryAll', 'create', 'delete'],
          ),
        },
      ],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(
      GlobalUserCategoriesModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
