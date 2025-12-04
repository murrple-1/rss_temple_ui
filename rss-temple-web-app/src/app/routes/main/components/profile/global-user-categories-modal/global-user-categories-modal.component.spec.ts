import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserCategoryService } from '@app/services/data';

import { GlobalUserCategoriesModalComponent } from './global-user-categories-modal.component';

describe('GlobalUserCategoriesModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        RouterModule.forRoot([]),
        GlobalUserCategoriesModalComponent,
      ],
      providers: [
        {
          provide: UserCategoryService,
          useValue: {
            queryAll: vi.fn().mockName('UserCategoryService.queryAll'),
            create: vi.fn().mockName('UserCategoryService.create'),
            delete: vi.fn().mockName('UserCategoryService.delete'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(
      GlobalUserCategoriesModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
