import { Router } from '@angular/router';
import { of } from 'rxjs';

import { FeedService } from '@app/services/data';

import { SubscribedFeedsFacadeService } from './subscribed-feeds-facade.service';

function setup() {
  const mockRouter = jasmine.createSpyObj<Router>(
    'Router',
    {},
    {
      'events': of(),
    },
  );
  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'query',
  ]);

  const feedsFacadeService = new SubscribedFeedsFacadeService(
    mockRouter,
    mockFeedService,
  );

  return {
    feedsFacadeService,

    mockFeedService,
  };
}

describe('FeedFacadeService', () => {
  it('should load', () => {
    const { feedsFacadeService } = setup();

    expect(feedsFacadeService).toBeTruthy();
  });

  // TODO more tests
});
