import { v4 } from 'uuid';

import { MockConfigService } from '@app/test/config.service.mock';

import { FeedEntryVoteService } from './feed-entry-vote.service';

function setup() {
  const mockConfigService = new MockConfigService({});

  const feedEntryVoteService = new FeedEntryVoteService(mockConfigService);

  return {
    mockConfigService,

    feedEntryVoteService,
  };
}

describe('FeedEntryVoteService', () => {
  it('should be consistent', () => {
    const { feedEntryVoteService } = setup();

    for (let i = 0; i < 10; i++) {
      const uuid = v4();
      const initial = feedEntryVoteService.shouldForceLabelVote(uuid);

      for (let j = 0; j < 10; j++) {
        expect(feedEntryVoteService.shouldForceLabelVote(uuid)).toBe(initial);
      }
    }
  });
});
