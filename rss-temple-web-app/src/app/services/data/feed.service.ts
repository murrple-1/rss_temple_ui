import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { Feed } from '@app/models';
import { ZFeed } from '@app/models/feed';
import { ConfigService } from '@app/services/config.service';
import { AllOptions } from '@app/services/data/all.interface';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { createCSRFTokenFnWithService } from '@app/services/data/csrftoken.lib';
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
export type SortField = keyof Omit<Feed, 'isDead' | 'archivedCount'>;

const ZExposedFeed = z.object({
  title: z.string(),
  href: z.url(),
});

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private readonly apiHost: string;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    configService: ConfigService,
  ) {
    const apiHost = configService.get<string>('apiHost');
    if (typeof apiHost !== 'string') {
      throw new Error('apiHost malformed');
    }

    this.apiHost = apiHost;
  }

  get(feedUrl: string, options: GetOptions<Field> = {}) {
    const headers = getToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );
    const params = getToParams<Field>(options, () => ['uuid']);
    params.url = feedUrl;

    return this.http
      .get<unknown>(`${this.apiHost}/api/feed`, {
        headers,
        params,
        withCredentials: true,
      })
      .pipe(map(retObj => ZFeed.parse(retObj)));
  }

  query(options: QueryOptions<Field, SortField> = {}) {
    const headers = queryToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );
    const params = queryToParams('feeds');
    const body = queryToBody<Field, SortField>(options, () => ['uuid']);

    return this.http
      .post<unknown>(`${this.apiHost}/api/feeds/query`, body, {
        headers,
        params,
        withCredentials: true,
      })
      .pipe(map(retObj => toObjects<Feed>(retObj, ZFeed)));
  }

  queryAll(options: AllOptions<Field, SortField> = {}, pageSize = 1000) {
    return queryAllFn(options, this.query.bind(this), pageSize);
  }

  lookupFeeds(url: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );
    const params: Record<string, string | string[]> = {
      url,
    };

    return this.http
      .get<unknown>(`${this.apiHost}/api/feed/lookup`, {
        headers,
        params,
        withCredentials: true,
      })
      .pipe(map(retObj => z.array(ZExposedFeed).parse(retObj)));
  }

  subscribe(url: string, customTitle?: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http.post<void>(
      `${this.apiHost}/api/feed/subscribe`,
      {
        url,
        customTitle,
      },
      {
        headers,
        withCredentials: true,
      },
    );
  }

  updateSubscriptions(
    url: string,
    customTitle: string | undefined,
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http.put<void>(
      `${this.apiHost}/api/feed/subscribe`,
      {
        url,
        customTitle,
      },
      {
        headers,
        withCredentials: true,
      },
    );
  }

  unsubscribe(url: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http.delete<void>(`${this.apiHost}/api/feed/subscribe`, {
      headers,
      body: {
        url,
      },
      withCredentials: true,
    });
  }
}
