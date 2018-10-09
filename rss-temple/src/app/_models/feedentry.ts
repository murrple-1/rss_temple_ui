import { Moment } from 'moment';

export class FeedEntry {
    uuid?: string;
    id?: string | null;
    createdAt?: Moment | null;
    publishedAt?: Moment;
    updatedAt?: Moment | null;
    title?: string;
    url?: string;
    content?: string | null;
    authorName?: string | null;
}
