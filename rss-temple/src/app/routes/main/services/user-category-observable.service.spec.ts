import { UserCategoryObservableService } from './user-category-observable.service';

function setup() {
  const userCategoryObservableService = new UserCategoryObservableService();

  return {
    userCategoryObservableService,
  };
}

describe('UserCategoryObservableService', () => {
  it('should fire userCategoriesChanged$', () => {
    const { userCategoryObservableService } = setup();

    const fn = jasmine.createSpy();

    const subscription = userCategoryObservableService.userCategoriesChanged$.subscribe(
      {
        next: fn,
      },
    );

    try {
      userCategoryObservableService.userCategoriesChanged$.next();

      expect(fn).toHaveBeenCalledTimes(1);
    } finally {
      subscription.unsubscribe();
    }
  });
});
