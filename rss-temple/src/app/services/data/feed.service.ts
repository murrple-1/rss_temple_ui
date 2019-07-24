import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import * as dayjs from 'dayjs';

import { Feed } from '@app/models';
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
  toParams as queryToParams,
} from '@app/services/data/query.interface';
import { AllOptions } from '@app/services/data/all.interface';
import { queryAllFn } from '@app/services/data/queryall.function';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import {
  JsonValue,
  isJsonObject,
  isJsonArray,
} from '@app/services/data/json.type';

import { environment } from '@environments/environment';

export type Field = keyof Feed;
export type SortField = keyof Feed;

function toFeed(value: JsonValue) {
  if (!isJsonObject(value)) {
    throw new Error('JSON must be object');
  }

  const feed = new Feed();

  if (value.uuid !== undefined) {
    const uuid = value.uuid;
    if (typeof uuid === 'string') {
      feed.uuid = uuid;
    } else {
      throw new Error("'uuid' must be string");
    }
  }

  if (value.title !== undefined) {
    const title = value.title;
    if (typeof title === 'string') {
      feed.title = title;
    } else {
      throw new Error("'title' must be string");
    }
  }

  if (value.feedUrl !== undefined) {
    const feedUrl = value.feedUrl;
    if (typeof feedUrl === 'string') {
      feed.feedUrl = feedUrl;
    } else {
      throw new Error("'feedUrl' must be string");
    }
  }

  if (value.homeUrl !== undefined) {
    const homeUrl = value.homeUrl;
    if (homeUrl === null || typeof homeUrl === 'string') {
      feed.homeUrl = homeUrl;
    } else {
      throw new Error("'homeUrl' must be string or null");
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
        feed.publishedAt = _dayjs;
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
      feed.updatedAt = null;
    } else if (typeof updatedAt === 'string') {
      const _dayjs = dayjs(updatedAt, {
        format: 'YYYY-MM-DD HH:mm:ss',
        utc: true,
      });
      if (_dayjs.isValid()) {
        feed.updatedAt = _dayjs;
      } else {
        throw new Error("'updatedAt' invalid");
      }
    } else {
      throw new Error("'publishedAt' must be datetime or null");
    }
  }

  if (value.subscribed !== undefined) {
    const subscribed = value.subscribed;
    if (typeof subscribed === 'boolean') {
      feed.subscribed = subscribed;
    } else {
      throw new Error("'subscribed' must be boolean");
    }
  }

  if (value.customTitle !== undefined) {
    const customTitle = value.customTitle;
    if (customTitle === null || typeof customTitle === 'string') {
      feed.customTitle = customTitle;
    } else {
      throw new Error("'customTitle' must be string or null");
    }
  }

  if (value.calculatedTitle !== undefined) {
    const calculatedTitle = value.calculatedTitle;
    if (typeof calculatedTitle === 'string') {
      feed.calculatedTitle = calculatedTitle;
    } else {
      throw new Error("'calculatedTitle' must be string");
    }
  }

  if (value.userCategoryUuids !== undefined) {
    const userCategoryUuids = value.userCategoryUuids;

    if (isJsonArray(userCategoryUuids)) {
      for (const userCategoryUuid of userCategoryUuids) {
        if (typeof userCategoryUuid !== 'string') {
          throw new Error("'userCategoryUuids' element must be string");
        }
      }

      feed.userCategoryUuids = userCategoryUuids as string[];
    } else {
      throw new Error("'userCategoryUuids' must be array");
    }
  }

  return feed;
}

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  constructor(private http: HttpClient) {}

  get(feedUrl: string, options: GetOptions<Field> = {}) {
    const headers = getToHeaders(options, sessionToken);
    const params = getToParams(options, () => ['uuid']);
    params.url = feedUrl;

    return this.http
      .get<JsonValue>(`${environment.apiHost}/api/feed`, {
        headers,
        params,
      })
      .pipe(map(toFeed));
  }

  query(options: QueryOptions<Field, SortField> = {}) {
    const headers = queryToHeaders(options, sessionToken);
    const params = queryToParams('feeds');
    const body = queryToBody(options, () => ['uuid']);

    return this.http
      .post<JsonValue>(`${environment.apiHost}/api/feeds/query`, body, {
        headers,
        params,
      })
      .pipe(map(retObj => toObjects<Feed>(retObj, toFeed)));
  }

  queryAll(options: AllOptions<Field, SortField> = {}, pageSize = 1000) {
    return queryAllFn(options, this.query.bind(this), pageSize);
  }

  subscribe(url: string, customTitle?: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);
    const params: {
      [header: string]: string | string[];
    } = {
      url,
    };

    if (customTitle !== undefined) {
      params.customtitle = customTitle;
    }

    return this.http.post<void>(
      `${environment.apiHost}/api/feed/subscribe`,
      null,
      {
        headers,
        params,
      },
    );
  }

  unsubscribe(url: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);
    const params: {
      [header: string]: string | string[];
    } = {
      url,
    };

    return this.http.delete<void>(`${environment.apiHost}/api/feed/subscribe`, {
      headers,
      params,
    });
  }
}
