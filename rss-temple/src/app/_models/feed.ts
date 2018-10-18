import { Moment } from 'moment';

export class Feed {
    uuid?: string;
    title?: string;
    feedUrl?: string;
    homeUrl?: string | null;
    publishedAt?: Moment;
    updatedAt?: Moment | null;
    subscribed?: boolean;
}
