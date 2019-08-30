import { Input, Directive } from '@angular/core';

import * as dayjs from 'dayjs';

import { FeedEntry, Feed } from '@app/models';

interface FeedImpl extends Feed {
  calculatedTitle: string;
  homeUrl: string | null;
}

interface FeedEntryImpl extends FeedEntry {
  url: string;
  title: string;
  content: string;
  isRead: boolean;
  isFavorite: boolean;
  authorName: string | null;
  publishedAt: dayjs.Dayjs;
}

@Directive()
export abstract class InnerViewDirective {
  @Input()
  feed?: FeedImpl;

  @Input()
  feedEntry?: FeedEntryImpl;
}
