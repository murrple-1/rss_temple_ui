import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FeedImpl, FeedObservableService } from './feed-observable.service';

describe('FeedObservableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeedObservableService],
    });
  });

  it('should fire feedAdded', () => {
    const feedObservableService = TestBed.inject(FeedObservableService);

    const fn = vi.fn();

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
    const feedObservableService = TestBed.inject(FeedObservableService);

    const fn = vi.fn();

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
    const feedObservableService = TestBed.inject(FeedObservableService);

    const fn = vi.fn();

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
