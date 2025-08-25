import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { FeedService } from '@app/services/data';

import { SubscribedFeedsFacadeService } from './subscribed-feeds-facade.service';

describe('FeedFacadeService', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>(
            'Router',
            {},
            {
              'events': of(),
            },
          ),
        },
        {
          provide: FeedService,
          useValue: jasmine.createSpyObj<FeedService>('FeedService', ['query']),
        },
      ],
    });
  });

  it('should load', () => {
    TestBed.runInInjectionContext(() => {
      const subscribedFeedsFacadeService = TestBed.inject(
        SubscribedFeedsFacadeService,
      );

      expect(subscribedFeedsFacadeService).toBeTruthy();
    });
  });

  // TODO more tests
});
