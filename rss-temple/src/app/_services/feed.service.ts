import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { utc } from 'moment';

import { Feed } from '@app/_models/feed';
import { sessionToken } from '@app/_modules/session.module';

import { environment } from '@environments/environment';

export type Field = 'uuid' | 'title' | 'feedUrl' | 'homeUrl' | 'publishedAt' | 'updatedAt';

function toFeed(value: Object) {
    const feed: Feed = {};

    if ('uuid' in value) {
        if (typeof value['uuid'] === 'string') {
            feed.uuid = value['uuid'];
        } else {
            throw new Error('\'uuid\' must be string');
        }
    }

    if ('title' in value) {
        if (typeof value['title'] === 'string') {
            feed.title = value['title'];
        } else {
            throw new Error('\'title\' must be string');
        }
    }

    if ('feedUrl' in value) {
        if (typeof value['feedUrl'] === 'string') {
            feed.feedUrl = value['feedUrl'];
        } else {
            throw new Error('\'feedUrl\' must be string');
        }
    }

    if ('homeUrl' in value) {
        if (value['homeUrl'] === null || typeof value['homeUrl'] === 'string') {
            feed.homeUrl = value['feedUrl'];
        } else {
            throw new Error('\'homeUrl\' must be string or null');
        }
    }

    if ('publishedAt' in value) {
        if (typeof value['publishedAt'] === 'string') {
            const _moment = utc(value['publishedAt'], 'YYYY-MM-DD HH:mm:ss');
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
        if (value['updatedAt'] === null) {
            feed.updatedAt = null;
        } else if (typeof value['updatedAt'] === 'string') {
            const _moment = utc(value['updatedAt'], 'YYYY-MM-DD HH:mm:ss');
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

    get(feedUrl: string, fields?: Field[], _sessionToken?: string) {
        return this.http.get(environment.apiHost + '/api/feed', {
            headers: {
                'X-Session-Token': _sessionToken || sessionToken()
            },
            params: {
                'url': feedUrl,
                'fields': (fields || ['uuid']).join(',')
            }
        }).pipe<Feed>(
            map(toFeed)
        );
    }
}
