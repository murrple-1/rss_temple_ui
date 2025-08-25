import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@app/services';

@Injectable()
export class FeedEntryVoteService {
  private showFeedEntryUuids = new Set<string>();
  private hideFeedEntryUuids = new Set<string>();

  private forceLabelThreshold: number;

  constructor() {
    const configService = inject(ConfigService);

    const forceLabelThreshold =
      configService.get<number>('forceLabelThreshold') ?? 0.5;
    if (typeof forceLabelThreshold !== 'number') {
      throw new Error('forceLabelThreshold malformed');
    }
    this.forceLabelThreshold = forceLabelThreshold;
  }

  shouldForceLabelVote(feedEntryUuid: string): boolean {
    if (this.showFeedEntryUuids.has(feedEntryUuid)) {
      return true;
    } else if (this.hideFeedEntryUuids.has(feedEntryUuid)) {
      return false;
    } else {
      if (Math.random() > this.forceLabelThreshold) {
        this.showFeedEntryUuids.add(feedEntryUuid);
        return true;
      } else {
        this.hideFeedEntryUuids.add(feedEntryUuid);
        return false;
      }
    }
  }

  forceHide(feedEntryUuid: string) {
    this.showFeedEntryUuids.delete(feedEntryUuid);
    this.hideFeedEntryUuids.add(feedEntryUuid);
  }
}
