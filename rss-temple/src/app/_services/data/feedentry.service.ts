import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { utc } from 'moment';

import { FeedEntry } from '@app/_models/feedentry';
import { sessionToken } from '@app/_modules/session.module';
import { Objects, toObjects } from '@app/_services/data/objects';

import { environment } from '@environments/environment';

export type Field = 'uuid' | 'id' | 'createdAt' | 'publishedAt' | 'updatedAt' | 'title' | 'url' | 'content' | 'authorName';

function toFeed(value: Record<string, any>) {
    const feedEntry = new FeedEntry();

    if ('uuid' in value) {
        const uuid = value['uuid'];
        if (typeof uuid === 'string') {
            feedEntry.uuid = uuid;
        } else {
            throw new Error('\'uuid\' must be string');
        }
    }

    if ('id' in value) {
        const id = value['id'];
        if (id === null) {
            feedEntry.id = null;
        } else if (typeof id === 'string') {
            feedEntry.id = id;
        } else {
            throw new Error('\'uuid\' must be string');
        }
    }

    if ('createdAt' in value) {
        const createdAt = value['createdAt'];
        if (createdAt === null) {
            feedEntry.createdAt = null;
        } else if (typeof createdAt === 'string') {
            const _moment = utc(createdAt, 'YYYY-MM-DD HH:mm:ss');
            if (_moment.isValid()) {
                feedEntry.createdAt = _moment;
            } else {
                throw new Error('\'createdAt\' invalid');
            }
        } else {
            throw new Error('\'publishedAt\' must be datetime or null');
        }
    }

    if ('publishedAt' in value) {
        const publishedAt = value['publishedAt'];
        if (typeof publishedAt === 'string') {
            const _moment = utc(publishedAt, 'YYYY-MM-DD HH:mm:ss');
            if (_moment.isValid()) {
                feedEntry.publishedAt = _moment;
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
            feedEntry.updatedAt = null;
        } else if (typeof updatedAt === 'string') {
            const _moment = utc(updatedAt, 'YYYY-MM-DD HH:mm:ss');
            if (_moment.isValid()) {
                feedEntry.updatedAt = _moment;
            } else {
                throw new Error('\'updatedAt\' invalid');
            }
        } else {
            throw new Error('\'publishedAt\' must be datetime or null');
        }
    }

    if ('title' in value) {
        const title = value['title'];
        if (typeof title === 'string') {
            feedEntry.title = title;
        } else {
            throw new Error('\'title\' must be string');
        }
    }

    if ('url' in value) {
        const url = value['url'];
        if (typeof url === 'string') {
            feedEntry.url = url;
        } else {
            throw new Error('\'url\' must be string');
        }
    }

    if ('content' in value) {
        const content = value['content'];
        if (content === null) {
            feedEntry.content = null;
        } else if (typeof content === 'string') {
            feedEntry.content = content;
        } else {
            throw new Error('\'uuid\' must be string');
        }
    }

    if ('authorName' in value) {
        const authorName = value['authorName'];
        if (authorName === null) {
            feedEntry.authorName = null;
        } else if (typeof authorName === 'string') {
            feedEntry.authorName = authorName;
        } else {
            throw new Error('\'uuid\' must be string');
        }
    }

    return feedEntry;
}

@Injectable()
export class FeedEntryService {
    constructor(
        private http: HttpClient,
    ) { }

    get(uuid: string, options: {
        fields?: Field[],
        sessionToken?: string,
        } = {}
    ) {
        const headers: {
            [header: string]: string | string[]
        } = {
            'X-Session-Token': options.sessionToken || sessionToken(),
        };

        const params: {
            [param: string]: string | string[]
        } = {
            'fields': (options.fields || ['uuid']).join(','),
        };

        return this.http.get(environment.apiHost + '/api/feedentry/' + uuid, {
            headers: headers,
            params: params,
        }).pipe<FeedEntry>(
            map(toFeed)
        );
    }

    some(options: {
            count?: number,
            fields?: Field[],
            search?: string,
            sessionToken?: string,
        } = {}
    ): Observable<Objects<FeedEntry>> {
        const headers: {
            [param: string]: string | string[]
        } = {
            'X-Session-Token': options.sessionToken || sessionToken(),
        };

        const params: {
            [header: string]: string | string[]
        } = {
            'fields': (options.fields || ['uuid']).join(','),
        };

        if (typeof options.count !== 'undefined') {
            params['count'] = options.count.toString();
        }

        if (typeof options.search !== 'undefined') {
            params['search'] = options.search;
        }

        return this.http.get<any[]>(environment.apiHost + '/api/feedentries', {
            headers: headers,
            params: params,
        }).pipe<Objects<FeedEntry>>(
            map(retObj => toObjects<FeedEntry>(retObj, toFeed))
        );
    }
}
