import { TestBed } from '@angular/core/testing';

import { UserCategoryObservableService } from './user-category-observable.service';

describe('UserCategoryObservableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserCategoryObservableService],
    });
  });

  it('should fire userCategoriesChanged$', () => {
    const userCategoryObservableService = TestBed.inject(
      UserCategoryObservableService,
    );

    const fn = jasmine.createSpy();

    const subscription =
      userCategoryObservableService.userCategoriesChanged$.subscribe({
        next: fn,
      });

    try {
      userCategoryObservableService.userCategoriesChanged$.next();

      expect(fn).toHaveBeenCalledTimes(1);
    } finally {
      subscription.unsubscribe();
    }
  });
});
