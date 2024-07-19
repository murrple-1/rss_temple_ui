import { FeedService } from '@app/services/data';

import { SubscribedFeedsFacadeService } from './subscribed-feeds-facade.service';

function setup() {
  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'query',
  ]);

  const feedsFacadeService = new SubscribedFeedsFacadeService(mockFeedService);

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
