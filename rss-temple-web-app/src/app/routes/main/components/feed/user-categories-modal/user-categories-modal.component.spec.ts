import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserCategoryService } from '@app/services/data';

import { UserCategoriesModalComponent } from './user-categories-modal.component';

describe('UserCategoriesModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserModule,
        ClarityModule,
        RouterModule.forRoot([]),
        UserCategoriesModalComponent,
      ],
      providers: [
        {
          provide: UserCategoryService,
          useValue: {
            queryAll: vi.fn().mockName('UserCategoryService.queryAll'),
            create: vi.fn().mockName('UserCategoryService.create'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(
      UserCategoriesModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
