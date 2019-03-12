import * as moment from 'moment';

export class Feed {
  uuid?: string;
  title?: string;
  feedUrl?: string;
  homeUrl?: string | null;
  publishedAt?: moment.Moment;
  updatedAt?: moment.Moment | null;
  subscribed?: boolean;
  customTitle?: string;
  calculatedTitle?: string;
}
