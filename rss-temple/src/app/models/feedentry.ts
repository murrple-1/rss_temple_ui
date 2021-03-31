export class FeedEntry {
  uuid?: string;
  id?: string | null;
  createdAt?: Date | null;
  publishedAt?: Date;
  updatedAt?: Date | null;
  title?: string;
  url?: string;
  content?: string;
  authorName?: string | null;
  feedUuid?: string;
  fromSubscription?: boolean;
  isRead?: boolean;
  isFavorite?: boolean;
  readAt?: Date | null;
}
