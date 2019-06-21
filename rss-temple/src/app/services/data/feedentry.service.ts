import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import * as dayjs from 'dayjs';

import { FeedEntry } from '@app/models';
import { sessionToken } from '@app/libs/session.lib';
import { toObjects } from '@app/services/data/objects';
import {
  GetOptions,
  toHeaders as getToHeaders,
  toParams as getToParams,
} from '@app/services/data/get.interface';
import {
  QueryOptions,
  toHeaders as queryToHeaders,
  toBody as queryToBody,
} from '@app/services/data/query.interface';
import { AllOptions } from '@app/services/data/all.interface';
import { queryAllFn } from '@app/services/data/queryall.function';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { JsonValue, isJsonObject } from '@app/services/data/json.type';

import { environment } from '@environments/environment';

export type Field = keyof FeedEntry;
export type SortField = keyof FeedEntry;

function toFeedEntry(value: JsonValue) {
  if (!isJsonObject(value)) {
    throw new Error('JSON must be object');
  }

  const feedEntry = new FeedEntry();

  if (value.uuid !== undefined) {
    const uuid = value.uuid;
    if (typeof uuid === 'string') {
      feedEntry.uuid = uuid;
    } else {
      throw new Error("'uuid' must be string");
    }
  }

  if (value.id !== undefined) {
    const id = value.id;
    if (id === null) {
      feedEntry.id = null;
    } else if (typeof id === 'string') {
      feedEntry.id = id;
    } else {
      throw new Error("'uuid' must be string");
    }
  }

  if (value.createdAt !== undefined) {
    const createdAt = value.createdAt;
    if (createdAt === null) {
      feedEntry.createdAt = null;
    } else if (typeof createdAt === 'string') {
      const _dayjs = dayjs(createdAt, {
        format: 'YYYY-MM-DD HH:mm:ss',
        utc: true,
      });
      if (_dayjs.isValid()) {
        feedEntry.createdAt = _dayjs;
      } else {
        throw new Error("'createdAt' invalid");
      }
    } else {
      throw new Error("'publishedAt' must be datetime or null");
    }
  }

  if (value.publishedAt !== undefined) {
    const publishedAt = value.publishedAt;
    if (typeof publishedAt === 'string') {
      const _dayjs = dayjs(publishedAt, {
        format: 'YYYY-MM-DD HH:mm:ss',
        utc: true,
      });
      if (_dayjs.isValid()) {
        feedEntry.publishedAt = _dayjs;
      } else {
        throw new Error("'publishedAt' invalid");
      }
    } else {
      throw new Error("'publishedAt' must be datetime");
    }
  }

  if (value.updatedAt !== undefined) {
    const updatedAt = value.updatedAt;
    if (updatedAt === null) {
      feedEntry.updatedAt = null;
    } else if (typeof updatedAt === 'string') {
      const _dayjs = dayjs(updatedAt, {
        format: 'YYYY-MM-DD HH:mm:ss',
        utc: true,
      });
      if (_dayjs.isValid()) {
        feedEntry.updatedAt = _dayjs;
      } else {
        throw new Error("'updatedAt' invalid");
      }
    } else {
      throw new Error("'publishedAt' must be datetime or null");
    }
  }

  if (value.title !== undefined) {
    const title = value.title;
    if (typeof title === 'string') {
      feedEntry.title = title;
    } else {
      throw new Error("'title' must be string");
    }
  }

  if (value.url !== undefined) {
    const url = value.url;
    if (typeof url === 'string') {
      feedEntry.url = url;
    } else {
      throw new Error("'url' must be string");
    }
  }

  if (value.content !== undefined) {
    const content = value.content;
    if (content === null) {
      feedEntry.content = null;
    } else if (typeof content === 'string') {
      feedEntry.content = content;
    } else {
      throw new Error("'content' must be string");
    }
  }

  if (value.authorName !== undefined) {
    const authorName = value.authorName;
    if (authorName === null) {
      feedEntry.authorName = null;
    } else if (typeof authorName === 'string') {
      feedEntry.authorName = authorName;
    } else {
      throw new Error("'authorName' must be string");
    }
  }

  if (value.fromSubscription !== undefined) {
    const fromSubscription = value.fromSubscription;
    if (typeof fromSubscription === 'boolean') {
      feedEntry.fromSubscription = fromSubscription;
    } else {
      throw new Error("'fromSubscription' must be boolean");
    }
  }

  if (value.isRead !== undefined) {
    const isRead = value.isRead;
    if (typeof isRead === 'boolean') {
      feedEntry.fromSubscription = isRead;
    } else {
      throw new Error("'isRead' must be boolean");
    }
  }

  if (value.isFavorite !== undefined) {
    const isFavorite = value.isFavorite;
    if (typeof isFavorite === 'boolean') {
      feedEntry.fromSubscription = isFavorite;
    } else {
      throw new Error("'isFavorite' must be boolean");
    }
  }

  if (value.feedUuid !== undefined) {
    const feedUuid = value.feedUuid;
    if (typeof feedUuid === 'string') {
      feedEntry.feedUuid = feedUuid;
    } else {
      throw new Error("'feedUuid' must be string");
    }
  }

  return feedEntry;
}

@Injectable()
export class FeedEntryService {
  constructor(private http: HttpClient) {}

  get(uuid: string, options: GetOptions<Field> = {}) {
    const headers = getToHeaders(options, sessionToken);
    const params = getToParams(options, () => ['uuid']);

    return this.http
      .get<JsonValue>(`${environment.apiHost}/api/feedentry/${uuid}`, {
        headers,
        params,
      })
      .pipe(map(toFeedEntry));
  }

  query(options: QueryOptions<Field, SortField> = {}) {
    const headers = queryToHeaders(options, sessionToken);
    const body = queryToBody(options, () => ['uuid']);

    return this.http
      .post<JsonValue>(`${environment.apiHost}/api/feedentries/query`, body, {
        headers,
      })
      .pipe(map(retObj => toObjects<FeedEntry>(retObj, toFeedEntry)));
  }

  queryAll(options: AllOptions<Field, SortField> = {}, pageSize = 1000) {
    return queryAllFn(options, this.query.bind(this), pageSize);
  }

  read(feedEntry: FeedEntry, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentry/${feedEntry.uuid}/read`,
      null,
      {
        headers,
      },
    );
  }

  unread(feedEntry: FeedEntry, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.delete<void>(
      `${environment.apiHost}/api/feedentry/${feedEntry.uuid}/read`,
      {
        headers,
      },
    );
  }

  readSome(feedEntries: FeedEntry[], options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentries/read/`,
      feedEntries.map(feedEntry => feedEntry.uuid),
      {
        headers,
      },
    );
  }

  unreadSome(feedEntries: FeedEntry[], options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.request<void>(
      'DELETE',
      `${environment.apiHost}/api/feedentries/read/`,
      {
        headers,
        body: feedEntries.map(feedEntry => feedEntry.uuid),
      },
    );
  }

  favorite(feedEntry: FeedEntry, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentry/${feedEntry.uuid}/favorite`,
      null,
      {
        headers,
      },
    );
  }

  unfavorite(feedEntry: FeedEntry, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.delete<void>(
      `${environment.apiHost}/api/feedentry/${feedEntry.uuid}/favorite`,
      {
        headers,
      },
    );
  }

  favoriteSome(feedEntries: FeedEntry[], options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentries/favorite/`,
      feedEntries.map(feedEntry => feedEntry.uuid),
      {
        headers,
      },
    );
  }

  unfavoriteSome(feedEntries: FeedEntry[], options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.request<void>(
      'DELETE',
      `${environment.apiHost}/api/feedentries/favorite/`,
      {
        headers,
        body: feedEntries.map(feedEntry => feedEntry.uuid),
      },
    );
  }
}
