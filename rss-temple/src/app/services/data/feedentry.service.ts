import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { parse as parseDate } from 'date-fns';

import { FeedEntry } from '@app/models';
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
  toParams as queryToParams,
} from '@app/services/data/query.interface';
import { AllOptions } from '@app/services/data/all.interface';
import { queryAllFn } from '@app/services/data/queryall.function';
import {
  CreateStableQueryOptions,
  StableQueryOptions,
  toCreateStableQueryBody,
  toCreateStableQueryHeaders,
  toCreateStableQueryParams,
  toStableQueryBody,
  toStableQueryHeaders,
  toStableQueryParams,
} from '@app/services/data/stablequery.interface';
import { stableQueryAllFn } from '@app/services/data/stablequeryall.function';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { JsonValue, isJsonObject, isJsonArray } from '@app/libs/json.lib';
import { SessionService } from '@app/services/session.service';

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
      feedEntry.createdAt = parseDate(
        createdAt,
        'yyyy-MM-dd HH:mm:ss',
        new Date(),
      );
      if (isNaN(feedEntry.createdAt.getTime())) {
        throw new Error("'createdAt' malformed");
      }
    } else {
      throw new Error("'createdAt' must be datetime or null");
    }
  }

  if (value.publishedAt !== undefined) {
    const publishedAt = value.publishedAt;
    if (typeof publishedAt === 'string') {
      feedEntry.publishedAt = parseDate(
        publishedAt,
        'yyyy-MM-dd HH:mm:ss',
        new Date(),
      );
      if (isNaN(feedEntry.publishedAt.getTime())) {
        throw new Error("'publishedAt' malformed");
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
      feedEntry.updatedAt = parseDate(
        updatedAt,
        'yyyy-MM-dd HH:mm:ss',
        new Date(),
      );
      if (isNaN(feedEntry.updatedAt.getTime())) {
        throw new Error("'updatedAt' malformed");
      }
    } else {
      throw new Error("'updatedAt' must be datetime or null");
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
    if (typeof content === 'string') {
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
      throw new Error("'authorName' must be string or null");
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
      feedEntry.isRead = isRead;
    } else {
      throw new Error("'isRead' must be boolean");
    }
  }

  if (value.isFavorite !== undefined) {
    const isFavorite = value.isFavorite;
    if (typeof isFavorite === 'boolean') {
      feedEntry.isFavorite = isFavorite;
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

  if (value.readAt !== undefined) {
    const readAt = value.readAt;
    if (readAt === null) {
      feedEntry.readAt = null;
    } else if (typeof readAt === 'string') {
      feedEntry.readAt = parseDate(readAt, 'yyyy-MM-dd HH:mm:ss', new Date());
      if (isNaN(feedEntry.readAt.getTime())) {
        throw new Error("'readAt' malformed");
      }
    } else {
      throw new Error("'readAt' must be datetime or null");
    }
  }

  return feedEntry;
}

@Injectable({
  providedIn: 'root',
})
export class FeedEntryService {
  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
  ) {}

  get(uuid: string, options: GetOptions<Field> = {}) {
    const headers = getToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );
    const params = getToParams<Field>(options, () => ['uuid']);

    return this.http
      .get<JsonValue>(`${environment.apiHost}/api/feedentry/${uuid}`, {
        headers,
        params,
      })
      .pipe(map(toFeedEntry));
  }

  query(options: QueryOptions<Field, SortField> = {}) {
    const headers = queryToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );
    const params = queryToParams('feedentries');
    const body = queryToBody<Field, SortField>(options, () => ['uuid']);

    return this.http
      .post<JsonValue>(`${environment.apiHost}/api/feedentries/query`, body, {
        headers,
        params,
      })
      .pipe(map(retObj => toObjects<FeedEntry>(retObj, toFeedEntry)));
  }

  queryAll(options: AllOptions<Field, SortField> = {}, pageSize = 1000) {
    return queryAllFn(options, this.query.bind(this), pageSize);
  }

  createStableQuery(options: CreateStableQueryOptions<SortField> = {}) {
    const headers = toCreateStableQueryHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );
    const params = toCreateStableQueryParams('feedentries');
    const body = toCreateStableQueryBody(options);

    return this.http
      .post<JsonValue>(
        `${environment.apiHost}/api/feedentries/query/stable/create`,
        body,
        {
          headers,
          params,
        },
      )
      .pipe(
        map(retObj => {
          if (typeof retObj !== 'string') {
            throw new Error('JSON body must be string');
          }

          return retObj;
        }),
      );
  }

  stableQuery(options: StableQueryOptions<Field>) {
    const headers = toStableQueryHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );
    const params = toStableQueryParams('feedentries');
    const body = toStableQueryBody<Field>(options, () => ['uuid']);

    return this.http
      .post<JsonValue>(
        `${environment.apiHost}/api/feedentries/query/stable`,
        body,
        {
          headers,
          params,
        },
      )
      .pipe(map(retObj => toObjects<FeedEntry>(retObj, toFeedEntry)));
  }

  stableQueryAll(options: AllOptions<Field, SortField> = {}, pageSize = 1000) {
    return stableQueryAllFn(
      options,
      this.createStableQuery.bind(this),
      this.query.bind(this),
      pageSize,
    );
  }

  read(feedEntryUuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http
      .post<JsonValue>(
        `${environment.apiHost}/api/feedentry/${feedEntryUuid}/read`,
        null,
        {
          headers,
        },
      )
      .pipe(
        map(response => {
          if (typeof response !== 'string') {
            throw new Error('JSON body must be string');
          }

          const readAt = parseDate(response, 'yyyy-MM-dd HH:mm:ss', new Date());
          if (isNaN(readAt.getTime())) {
            throw new Error('JSON body malformed');
          }

          return readAt;
        }),
      );
  }

  unread(feedEntryUuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http.delete<void>(
      `${environment.apiHost}/api/feedentry/${feedEntryUuid}/read`,
      {
        headers,
      },
    );
  }

  readSome(
    feedEntryUuids: string[] | undefined,
    feedUuids: string[] | undefined,
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentries/read/`,
      {
        feedEntryUuids,
        feedUuids,
      },
      {
        headers,
      },
    );
  }

  unreadSome(feedEntryUuids: string[], options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http.request<void>(
      'DELETE',
      `${environment.apiHost}/api/feedentries/read/`,
      {
        headers,
        body: feedEntryUuids,
      },
    );
  }

  favorite(feedEntryUuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentry/${feedEntryUuid}/favorite`,
      null,
      {
        headers,
      },
    );
  }

  unfavorite(feedEntryUuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http.delete<void>(
      `${environment.apiHost}/api/feedentry/${feedEntryUuid}/favorite`,
      {
        headers,
      },
    );
  }

  favoriteSome(feedEntryUuids: string[], options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http.post<void>(
      `${environment.apiHost}/api/feedentries/favorite/`,
      feedEntryUuids,
      {
        headers,
      },
    );
  }

  unfavoriteSome(feedEntryUuids: string[], options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http.request<void>(
      'DELETE',
      `${environment.apiHost}/api/feedentries/favorite/`,
      {
        headers,
        body: feedEntryUuids,
      },
    );
  }
}
