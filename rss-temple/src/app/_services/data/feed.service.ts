import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { utc } from 'moment';

import { Feed } from '@app/_models/feed';
import { sessionToken } from '@app/_modules/session.module';
import { Objects, toObjects } from '@app/_services/data/objects';
import {
    GetOptions,
    toHeader as getToHeader,
    toParams as getToParams,
} from '@app/_services/data/get.interface';
import {
    SomeOptions,
    toHeader as someToHeader,
    toParams as someToParams,
} from '@app/_services/data/some.interface';

import { environment } from '@environments/environment';

export type Field = 'uuid' | 'title' | 'feedUrl' | 'homeUrl' | 'publishedAt' | 'updatedAt';

function toFeed(value: Record<string, any>) {
    const feed = new Feed();

    if ('uuid' in value) {
        const uuid = value['uuid'];
        if (typeof uuid === 'string') {
            feed.uuid = uuid;
        } else {
            throw new Error('\'uuid\' must be string');
        }
    }

    if ('title' in value) {
        const title = value['title'];
        if (typeof title === 'string') {
            feed.title = title;
        } else {
            throw new Error('\'title\' must be string');
        }
    }

    if ('feedUrl' in value) {
        const feedUrl = value['feedUrl'];
        if (typeof feedUrl === 'string') {
            feed.feedUrl = feedUrl;
        } else {
            throw new Error('\'feedUrl\' must be string');
        }
    }

    if ('homeUrl' in value) {
        const homeUrl = value['homeUrl'];
        if (homeUrl === null || typeof homeUrl === 'string') {
            feed.homeUrl = homeUrl;
        } else {
            throw new Error('\'homeUrl\' must be string or null');
        }
    }

    if ('publishedAt' in value) {
        const publishedAt = value['publishedAt'];
        if (typeof publishedAt === 'string') {
            const _moment = utc(publishedAt, 'YYYY-MM-DD HH:mm:ss');
            if (_moment.isValid()) {
                feed.publishedAt = _moment;
            } else {
                throw new Error('\'publishedAt\' invalid');
            }
        } else {
            throw new Error('\'publishedAt\' must be datetime');
        }
    }

    if ('updatedAt' in value) {
        const updatedAt = value['updatedAt'];
        if (updatedAt === null) {
            feed.updatedAt = null;
        } else if (typeof updatedAt === 'string') {
            const _moment = utc(updatedAt, 'YYYY-MM-DD HH:mm:ss');
            if (_moment.isValid()) {
                feed.updatedAt = _moment;
            } else {
                throw new Error('\'updatedAt\' invalid');
            }
        } else {
            throw new Error('\'publishedAt\' must be datetime or null');
        }
    }

    return feed;
}

@Injectable()
export class FeedService {
    constructor(
        private http: HttpClient,
    ) { }

    get(feedUrl: string, options: GetOptions<Field> = {}) {
        const headers = getToHeader(options, sessionToken);
        const params = getToParams(options, () => ['uuid']);
        params['url'] = feedUrl;

        return this.http.get(environment.apiHost + '/api/feed', {
            headers: headers,
            params: params,
        }).pipe<Feed>(
            map(toFeed)
        );
    }

    some(options: SomeOptions<Field> = {}) {
        const headers = someToHeader(options, sessionToken);
        const params = someToParams(options, () => ['uuid']);

        return this.http.get(environment.apiHost + '/api/feeds', {
            headers: headers,
            params: params,
        }).pipe<Objects<Feed>>(
            map(retObj => toObjects<Feed>(retObj, toFeed))
        );
    }
}
