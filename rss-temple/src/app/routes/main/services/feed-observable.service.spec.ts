import { Feed } from '@app/models';

import { FeedObservableService, FeedImpl } from './feed-observable.service';

function setup() {
  const feedObservableService = new FeedObservableService();

  return {
    feedObservableService,
  };
}

describe('FeedObservableService', () => {
  it('should fire feedAdded', () => {
    const { feedObservableService } = setup();

    const fn = jasmine.createSpy();

    const subscription = feedObservableService.feedAdded.subscribe({
      next: fn,
    });

    try {
      feedObservableService.feedAdded.next({} as FeedImpl);

      expect(fn).toHaveBeenCalledTimes(1);
    } finally {
      subscription.unsubscribe();
    }
  });

  it('should fire feedRemoved', () => {
    const { feedObservableService } = setup();

    const fn = jasmine.createSpy();

    const subscription = feedObservableService.feedRemoved.subscribe({
      next: fn,
    });

    try {
      feedObservableService.feedRemoved.next({} as FeedImpl);

      expect(fn).toHaveBeenCalledTimes(1);
    } finally {
      subscription.unsubscribe();
    }
  });

  it('should fire feedsChanged', () => {
    const { feedObservableService } = setup();

    const fn = jasmine.createSpy();

    const subscription = feedObservableService.feedsChanged.subscribe({
      next: fn,
    });

    try {
      feedObservableService.feedsChanged.next();

      expect(fn).toHaveBeenCalledTimes(1);
    } finally {
      subscription.unsubscribe();
    }
  });
});
