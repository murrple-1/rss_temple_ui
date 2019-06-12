import * as dayjs from 'dayjs';

export class FeedEntry {
  uuid?: string;
  id?: string | null;
  createdAt?: dayjs.Dayjs | null;
  publishedAt?: dayjs.Dayjs;
  updatedAt?: dayjs.Dayjs | null;
  title?: string;
  url?: string;
  content?: string | null;
  authorName?: string | null;
  feedUuid?: string;
  fromSubscription?: boolean;
  isRead?: boolean;
  isFavorite?: boolean;
}
