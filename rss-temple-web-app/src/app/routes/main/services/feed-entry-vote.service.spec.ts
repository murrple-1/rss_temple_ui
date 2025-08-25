import { TestBed } from '@angular/core/testing';
import { v4 } from 'uuid';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { FeedEntryVoteService } from './feed-entry-vote.service';

describe('FeedEntryVoteService', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {},
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    });
  });

  it('should be consistent', () => {
    TestBed.runInInjectionContext(() => {
      const feedEntryVoteService = TestBed.inject(FeedEntryVoteService);

      for (let i = 0; i < 10; i++) {
        const uuid = v4();
        const initial = feedEntryVoteService.shouldForceLabelVote(uuid);

        for (let j = 0; j < 10; j++) {
          expect(feedEntryVoteService.shouldForceLabelVote(uuid)).toBe(initial);
        }
      }
    });
  });
});
