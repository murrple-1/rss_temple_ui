import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { Feed } from '@app/models';
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
import { AuthTokenService } from '@app/services/auth-token.service';

import { environment } from '@environments/environment';
import { ZFeed } from '@app/models/feed';

export type Field = keyof Feed;
export type SortField = keyof Feed;

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
  ) {}

  get(feedUrl: string, options: GetOptions<Field> = {}) {
    const headers = getToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = getToParams<Field>(options, () => ['uuid']);
    params.url = feedUrl;

    return this.http
      .get<unknown>(`${environment.envVar.API_HOST}/api/feed`, {
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
      .post<unknown>(`${environment.envVar.API_HOST}/api/feeds/query`, body, {
        headers,
        params,
      })
      .pipe(map(retObj => toObjects<Feed>(retObj, ZFeed)));
  }

  queryAll(options: AllOptions<Field, SortField> = {}, pageSize = 1000) {
    return queryAllFn(options, this.query.bind(this), pageSize);
  }

  subscribe(url: string, customTitle?: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params: Record<string, string | string[]> = {
      url,
    };

    if (customTitle !== undefined) {
      params.customtitle = customTitle;
    }

    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/feed/subscribe`,
      null,
      {
        headers,
        params,
      },
    );
  }

  updateSubscriptions(
    url: string,
    customTitle: string | null,
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params: Record<string, string | string[]> = {
      url,
    };

    if (customTitle !== null) {
      params['customtitle'] = customTitle;
    }

    return this.http.put<void>(
      `${environment.envVar.API_HOST}/api/feed/subscribe`,
      null,
      {
        headers,
        params,
      },
    );
  }

  unsubscribe(url: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params: Record<string, string | string[]> = {
      url,
    };

    return this.http.delete<void>(
      `${environment.envVar.API_HOST}/api/feed/subscribe`,
      {
        headers,
        params,
      },
    );
  }
}
