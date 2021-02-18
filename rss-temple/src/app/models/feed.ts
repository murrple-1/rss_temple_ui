export class Feed {
  uuid?: string;
  title?: string;
  feedUrl?: string;
  homeUrl?: string | null;
  publishedAt?: Date;
  updatedAt?: Date | null;
  subscribed?: boolean;
  customTitle?: string | null;
  calculatedTitle?: string;
  userCategoryUuids?: string[];
}
