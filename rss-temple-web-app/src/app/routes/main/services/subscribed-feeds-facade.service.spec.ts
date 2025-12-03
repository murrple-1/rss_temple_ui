import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FeedService } from '@app/services/data';

import { SubscribedFeedsFacadeService } from './subscribed-feeds-facade.service';

describe('SubscribedFeedFacadeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            'events': of(),
          },
        },
        {
          provide: FeedService,
          useValue: {
            query: vi.fn().mockName('FeedService.query'),
          },
        },
        SubscribedFeedsFacadeService,
      ],
    });
  });

  it('should load', () => {
    const subscribedFeedsFacadeService = TestBed.inject(
      SubscribedFeedsFacadeService,
    );

    expect(subscribedFeedsFacadeService).toBeTruthy();
  });

  // TODO more tests
});
