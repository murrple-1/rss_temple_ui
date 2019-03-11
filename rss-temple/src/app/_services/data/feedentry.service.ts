import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { utc } from 'moment';

import { FeedEntry } from '@app/_models';
import { sessionToken } from '@app/_modules/session.module';
import { Objects, toObjects } from '@app/_services/data/objects';
import {
  GetOptions,
  toHeader as getToHeader,
  toParams as getToParams,
} from '@app/_services/data/get.interface';
import {
  QueryOptions,
  toHeader as queryToHeader,
  toBody as queryToBody,
} from '@app/_services/data/query.interface';
import { AllOptions } from '@app/_services/data/all.interface';
import { queryAllFn } from '@app/_services/data/queryall.function';
import {
  CommonOptions,
  toHeader as commonToHeader,
} from '@app/_services/data/common.interface';

import { environment } from '@environments/environment';

export type Field =
  | 'uuid'
  | 'id'
  | 'createdAt'
  | 'publishedAt'
  | 'updatedAt'
  | 'title'
  | 'url'
  | 'content'
  | 'authorName'
  | 'fromSubscrption'
  | 'isRead'
  | 'isFavorite';

function toFeedEntry(value: Record<string, any>) {
  const feedEntry = new FeedEntry();

  if (value.hasOwnProperty('uuid')) {
    const uuid = value['uuid'];
    if (typeof uuid === 'string') {
      feedEntry.uuid = uuid;
    } else {
      throw new Error("'uuid' must be string");
    }
  }

  if (value.hasOwnProperty('id')) {
    const id = value['id'];
    if (id === null) {
      feedEntry.id = null;
    } else if (typeof id === 'string') {
      feedEntry.id = id;
    } else {
      throw new Error("'uuid' must be string");
    }
  }

  if (value.hasOwnProperty('createdAt')) {
    const createdAt = value['createdAt'];
    if (createdAt === null) {
      feedEntry.createdAt = null;
    } else if (typeof createdAt === 'string') {
      const _moment = utc(createdAt, 'YYYY-MM-DD HH:mm:ss');
      if (_moment.isValid()) {
        feedEntry.createdAt = _moment;
      } else {
        throw new Error("'createdAt' invalid");
      }
    } else {
      throw new Error("'publishedAt' must be datetime or null");
    }
  }

  if (value.hasOwnProperty('publishedAt')) {
    const publishedAt = value['publishedAt'];
    if (typeof publishedAt === 'string') {
      const _moment = utc(publishedAt, 'YYYY-MM-DD HH:mm:ss');
      if (_moment.isValid()) {
        feedEntry.publishedAt = _moment;
      } else {
        throw new Error("'publishedAt' invalid");
      }
    } else {
      throw new Error("'publishedAt' must be datetime");
    }
  }

  if (value.hasOwnProperty('updatedAt')) {
    const updatedAt = value['updatedAt'];
    if (updatedAt === null) {
      feedEntry.updatedAt = null;
    } else if (typeof updatedAt === 'string') {
      const _moment = utc(updatedAt, 'YYYY-MM-DD HH:mm:ss');
      if (_moment.isValid()) {
        feedEntry.updatedAt = _moment;
      } else {
        throw new Error("'updatedAt' invalid");
      }
    } else {
      throw new Error("'publishedAt' must be datetime or null");
    }
  }

  if (value.hasOwnProperty('title')) {
    const title = value['title'];
    if (typeof title === 'string') {
      feedEntry.title = title;
    } else {
      throw new Error("'title' must be string");
    }
  }

  if (value.hasOwnProperty('url')) {
    const url = value['url'];
    if (typeof url === 'string') {
      feedEntry.url = url;
    } else {
      throw new Error("'url' must be string");
    }
  }

  if (value.hasOwnProperty('content')) {
    const content = value['content'];
    if (content === null) {
      feedEntry.content = null;
    } else if (typeof content === 'string') {
      feedEntry.content = content;
    } else {
      throw new Error("'content' must be string");
    }
  }

  if (value.hasOwnProperty('authorName')) {
    const authorName = value['authorName'];
    if (authorName === null) {
      feedEntry.authorName = null;
    } else if (typeof authorName === 'string') {
      feedEntry.authorName = authorName;
    } else {
      throw new Error("'authorName' must be string");
    }
  }

  if (value.hasOwnProperty('fromSubscription')) {
    const fromSubscription = value['fromSubscription'];
    if (typeof fromSubscription === 'boolean') {
      feedEntry.fromSubscription = fromSubscription;
    } else {
      throw new Error("'fromSubscription' must be boolean");
    }
  }

  if (value.hasOwnProperty('isRead')) {
    const isRead = value['isRead'];
    if (typeof isRead === 'boolean') {
      feedEntry.fromSubscription = isRead;
    } else {
      throw new Error("'isRead' must be boolean");
    }
  }

  if (value.hasOwnProperty('isFavorite')) {
    const isFavorite = value['isFavorite'];
    if (typeof isFavorite === 'boolean') {
      feedEntry.fromSubscription = isFavorite;
    } else {
      throw new Error("'isFavorite' must be boolean");
    }
  }

  return feedEntry;
}

@Injectable()
export class FeedEntryService {
  constructor(private http: HttpClient) {}

  get(uuid: string, options: GetOptions<Field> = {}) {
    const headers = getToHeader(options, sessionToken);
    const params = getToParams(options, () => ['uuid']);

    return this.http
      .get(`${environment.apiHost}/api/feedentry/${uuid}`, {
        headers: headers,
        params: params,
      })
      .pipe<FeedEntry>(map(toFeedEntry));
  }

  query(options: QueryOptions<Field> = {}) {
    const headers = queryToHeader(options, sessionToken);
    const body = queryToBody(options, () => ['uuid']);

    return this.http
      .post(`${environment.apiHost}/api/feedentries/query`, body, {
        headers: headers,
      })
      .pipe<Objects<FeedEntry>>(
        map(retObj => toObjects<FeedEntry>(retObj, toFeedEntry)),
      );
  }

  queryAll(options: AllOptions<Field> = {}, pageSize = 1000) {
    return queryAllFn(options, this.query.bind(this), toFeedEntry, pageSize);
  }

  read(feedEntry: FeedEntry, options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentry/${feedEntry.uuid}/read`,
      null,
      {
        headers: headers,
      },
    );
  }

  unread(feedEntry: FeedEntry, options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http.delete<void>(
      `${environment.apiHost}/api/feedentry/${feedEntry.uuid}/read`,
      {
        headers: headers,
      },
    );
  }

  readSome(feedEntries: FeedEntry[], options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentries/read/`,
      feedEntries.map(feedEntry => feedEntry.uuid),
      {
        headers: headers,
      },
    );
  }

  unreadSome(feedEntries: FeedEntry[], options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http.request<void>(
      'DELETE',
      `${environment.apiHost}/api/feedentries/read/`,
      {
        headers: headers,
        body: feedEntries.map(feedEntry => feedEntry.uuid),
      },
    );
  }

  favorite(feedEntry: FeedEntry, options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentry/${feedEntry.uuid}/favorite`,
      null,
      {
        headers: headers,
      },
    );
  }

  unfavorite(feedEntry: FeedEntry, options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http.delete<void>(
      `${environment.apiHost}/api/feedentry/${feedEntry.uuid}/favorite`,
      {
        headers: headers,
      },
    );
  }

  favoriteSome(feedEntries: FeedEntry[], options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentries/favorite/`,
      feedEntries.map(feedEntry => feedEntry.uuid),
      {
        headers: headers,
      },
    );
  }

  unfavoriteSome(feedEntries: FeedEntry[], options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http.request<void>(
      'DELETE',
      `${environment.apiHost}/api/feedentries/favorite/`,
      {
        headers: headers,
        body: feedEntries.map(feedEntry => feedEntry.uuid),
      },
    );
  }
}
