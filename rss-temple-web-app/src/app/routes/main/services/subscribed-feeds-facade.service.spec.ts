import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { FeedService } from '@app/services/data';

import { SubscribedFeedsFacadeService } from './subscribed-feeds-facade.service';

describe('SubscribedFeedFacadeService', () => {
  beforeEach(() => {
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
