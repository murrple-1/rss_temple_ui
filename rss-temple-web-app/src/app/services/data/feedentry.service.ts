import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { parse as parseDate } from 'date-fns';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { FeedEntry } from '@app/models';
import { ZFeedEntry } from '@app/models/feedentry';
import { AuthTokenService } from '@app/services/auth-token.service';
import { ConfigService } from '@app/services/config.service';
import { AllOptions } from '@app/services/data/all.interface';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import {
  GetOptions,
  toHeaders as getToHeaders,
  toParams as getToParams,
} from '@app/services/data/get.interface';
import { toObjects } from '@app/services/data/objects';
import {
  QueryOptions,
  toBody as queryToBody,
  toHeaders as queryToHeaders,
  toParams as queryToParams,
} from '@app/services/data/query.interface';
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

export type Field = keyof FeedEntry;
export type SortField = keyof Omit<FeedEntry, 'topImageSrc'>;

const ZLanguages = z.object({
  languages: z.array(z.string()),
});

@Injectable({
  providedIn: 'root',
})
export class FeedEntryService {
  private readonly apiHost: string;

  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
    configService: ConfigService,
  ) {
    const apiHost = configService.get<string>('apiHost');
    if (typeof apiHost !== 'string') {
      throw new Error('apiHost malformed');
    }

    this.apiHost = apiHost;
  }

  get(uuid: string, options: GetOptions<Field> = {}) {
    const headers = getToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = getToParams<Field>(options, () => ['uuid']);

    return this.http
      .get<unknown>(`${this.apiHost}/api/feedentry/${uuid}`, {
        headers,
        params,
      })
      .pipe(map(retObj => ZFeedEntry.parse(retObj)));
  }

  query(options: QueryOptions<Field, SortField> = {}) {
    const headers = queryToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = queryToParams('feedentries');
    const body = queryToBody<Field, SortField>(options, () => ['uuid']);

    return this.http
      .post<unknown>(`${this.apiHost}/api/feedentries/query`, body, {
        headers,
        params,
      })
      .pipe(map(retObj => toObjects<FeedEntry>(retObj, ZFeedEntry)));
  }

  queryAll(options: AllOptions<Field, SortField> = {}, pageSize = 1000) {
    return queryAllFn(options, this.query.bind(this), pageSize);
  }

  createStableQuery(options: CreateStableQueryOptions<SortField> = {}) {
    const headers = toCreateStableQueryHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = toCreateStableQueryParams('feedentries');
    const body = toCreateStableQueryBody(options);

    return this.http
      .post<unknown>(
        `${this.apiHost}/api/feedentries/query/stable/create`,
        body,
        {
          headers,
          params,
        },
      )
      .pipe(map(retObj => z.string().parse(retObj)));
  }

  stableQuery(options: StableQueryOptions<Field>) {
    const headers = toStableQueryHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = toStableQueryParams('feedentries');
    const body = toStableQueryBody<Field>(options, () => ['uuid']);

    return this.http
      .post<unknown>(`${this.apiHost}/api/feedentries/query/stable`, body, {
        headers,
        params,
      })
      .pipe(map(retObj => toObjects<FeedEntry>(retObj, ZFeedEntry)));
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
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .post<unknown>(
        `${this.apiHost}/api/feedentry/${feedEntryUuid}/read`,
        null,
        {
          headers,
        },
      )
      .pipe(
        map(response => {
          if (typeof response !== 'string') {
            throw new Error('JSON body must be string or null');
          }

          if (response.length < 1) {
            // feed entry is archived (ie perma-read)
            return null;
          } else {
            const readAt = parseDate(
              response,
              'yyyy-MM-dd HH:mm:ss',
              new Date(),
            );
            if (isNaN(readAt.getTime())) {
              throw new Error('JSON body malformed');
            }

            return readAt;
          }
        }),
      );
  }

  unread(feedEntryUuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.delete<void>(
      `${this.apiHost}/api/feedentry/${feedEntryUuid}/read`,
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
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.post<void>(
      `${this.apiHost}/api/feedentries/read/`,
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
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.request<void>(
      'DELETE',
      `${this.apiHost}/api/feedentries/read/`,
      {
        headers,
        body: {
          feedEntryUuids,
        },
      },
    );
  }

  favorite(feedEntryUuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.post<void>(
      `${this.apiHost}/api/feedentry/${feedEntryUuid}/favorite`,
      null,
      {
        headers,
      },
    );
  }

  unfavorite(feedEntryUuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.delete<void>(
      `${this.apiHost}/api/feedentry/${feedEntryUuid}/favorite`,
      {
        headers,
      },
    );
  }

  favoriteSome(feedEntryUuids: string[], options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.post<void>(
      `${this.apiHost}/api/feedentries/favorite`,
      feedEntryUuids,
      {
        headers,
      },
    );
  }

  unfavoriteSome(feedEntryUuids: string[], options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.request<void>(
      'DELETE',
      `${this.apiHost}/api/feedentries/favorite`,
      {
        headers,
        body: {
          feedEntryUuids,
        },
      },
    );
  }

  getLanguages(
    kind?: 'iso639_3' | 'iso639_1' | 'name',
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    const params: Record<string, string | string[]> = {};
    if (kind !== undefined) {
      params['kind'] = kind;
    }

    return this.http
      .get<void>(`${this.apiHost}/api/feedentry/languages`, {
        headers,
        params,
      })
      .pipe(map(retObj => ZLanguages.parse(retObj).languages));
  }
}
