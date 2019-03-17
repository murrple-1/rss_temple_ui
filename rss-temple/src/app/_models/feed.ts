import * as dayjs from 'dayjs';

export class Feed {
  uuid?: string;
  title?: string;
  feedUrl?: string;
  homeUrl?: string | null;
  publishedAt?: dayjs.Dayjs;
  updatedAt?: dayjs.Dayjs | null;
  subscribed?: boolean;
  customTitle?: string;
  calculatedTitle?: string;
}
