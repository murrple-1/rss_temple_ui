import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
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
        BrowserModule,
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
