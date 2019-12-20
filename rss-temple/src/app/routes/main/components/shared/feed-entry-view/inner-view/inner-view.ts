import { Input } from '@angular/core';

import { FeedEntry, Feed } from '@app/models';

type FeedImpl = Required<Pick<Feed, 'calculatedTitle' | 'homeUrl'>>;
type FeedEntryImpl = Required<
  Pick<
    FeedEntry,
    | 'url'
    | 'title'
    | 'content'
    | 'isRead'
    | 'isFavorite'
    | 'authorName'
    | 'publishedAt'
  >
>;

export abstract class InnerView {
  @Input()
  feed?: FeedImpl;

  @Input()
  feedEntry?: FeedEntryImpl;
}
