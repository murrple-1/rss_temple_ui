import { Input, Directive } from '@angular/core';

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

@Directive({})
export abstract class InnerViewDirective {
  @Input()
  feed?: FeedImpl;

  @Input()
  feedEntry?: FeedEntryImpl;
}
