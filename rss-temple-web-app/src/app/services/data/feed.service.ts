import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { Feed } from '@app/models';
import { ZFeed } from '@app/models/feed';
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

export type Field = keyof Feed;
export type SortField = keyof Feed;

const ZExposedFeed = z.object({
  title: z.string(),
  href: z.string().url(),
});

@Injectable({
  providedIn: 'root',
})
export class FeedService {
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

  get(feedUrl: string, options: GetOptions<Field> = {}) {
    const headers = getToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = getToParams<Field>(options, () => ['uuid']);
    params.url = feedUrl;

    return this.http
      .get<unknown>(`${this.apiHost}/api/feed`, {
        headers,
        params,
      })
      .pipe(map(retObj => ZFeed.parse(retObj)));
  }

  query(options: QueryOptions<Field, SortField> = {}) {
    const headers = queryToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = queryToParams('feeds');
    const body = queryToBody<Field, SortField>(options, () => ['uuid']);

    return this.http
      .post<unknown>(`${this.apiHost}/api/feeds/query`, body, {
        headers,
        params,
      })
      .pipe(map(retObj => toObjects<Feed>(retObj, ZFeed)));
  }

  queryAll(options: AllOptions<Field, SortField> = {}, pageSize = 1000) {
    return queryAllFn(options, this.query.bind(this), pageSize);
  }

  lookupFeeds(url: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params: Record<string, string | string[]> = {
      url,
    };

    return this.http
      .get<unknown>(`${this.apiHost}/api/feed/lookup`, {
        headers,
        params,
      })
      .pipe(map(retObj => z.array(ZExposedFeed).parse(retObj)));
  }

  subscribe(url: string, customTitle?: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.post<void>(
      `${this.apiHost}/api/feed/subscribe`,
      {
        url,
        customTitle,
      },
      {
        headers,
      },
    );
  }

  updateSubscriptions(
    url: string,
    customTitle: string | undefined,
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.put<void>(
      `${this.apiHost}/api/feed/subscribe`,
      {
        url,
        customTitle,
      },
      {
        headers,
      },
    );
  }

  unsubscribe(url: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.delete<void>(`${this.apiHost}/api/feed/subscribe`, {
      headers,
      body: {
        url,
      },
    });
  }
}
