import * as moment from 'moment';

export class FeedEntry {
  uuid?: string;
  id?: string | null;
  createdAt?: moment.Moment | null;
  publishedAt?: moment.Moment;
  updatedAt?: moment.Moment | null;
  title?: string;
  url?: string;
  content?: string | null;
  authorName?: string | null;
  fromSubscription?: boolean;
  isRead?: boolean;
  isFavorite?: boolean;
}
