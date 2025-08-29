import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { v4 } from 'uuid';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { FeedEntryVoteService } from './feed-entry-vote.service';

describe('FeedEntryVoteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {},
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
        FeedEntryVoteService,
      ],
    });
  });

  it('should be consistent', () => {
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
