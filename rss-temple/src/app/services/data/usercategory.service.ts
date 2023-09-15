import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { UserCategory } from '@app/models';
import { ZUserCategory } from '@app/models/usercategory';
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

export type Field = keyof UserCategory;
export type SortField = keyof UserCategory;

export interface ICreateUserCategory {
  text: string;
}

export type IUpdateUserCategory = ICreateUserCategory;

export interface IApply {
  [feedUuid: string]: Set<string>;
}

@Injectable({
  providedIn: 'root',
})
export class UserCategoryService {
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
      .get<unknown>(`${this.apiHost}/api/usercategory/${uuid}`, {
        headers,
        params,
      })
      .pipe(map(retObj => ZUserCategory.parse(retObj)));
  }

  query(options: QueryOptions<Field, SortField> = {}) {
    const headers = queryToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = queryToParams('usercategories');
    const body = queryToBody<Field, SortField>(options, () => ['uuid']);

    return this.http
      .post<unknown>(`${this.apiHost}/api/usercategories/query`, body, {
        headers,
        params,
      })
      .pipe(map(retObj => toObjects(retObj, ZUserCategory)));
  }

  queryAll(options: AllOptions<Field, SortField> = {}, pageSize = 1000) {
    return queryAllFn(options, this.query.bind(this), pageSize);
  }

  create(
    userCategoryJson: ICreateUserCategory,
    options: GetOptions<Field> = {},
  ) {
    const headers = getToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    const params = getToParams<Field>(options, () => ['uuid']);

    return this.http
      .post<unknown>(`${this.apiHost}/api/usercategory`, userCategoryJson, {
        headers,
        params,
        responseType: 'json',
      })
      .pipe(map(retObj => ZUserCategory.parse(retObj)));
  }

  delete(uuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.delete<void>(`${this.apiHost}/api/usercategory/${uuid}`, {
      headers,
    });
  }

  apply(apply: IApply, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    const mappings: Record<string, string[]> = {};

    for (const [feedUuid, uuids] of Object.entries(apply)) {
      mappings[feedUuid] = Array.from(uuids);
    }

    return this.http.put<void>(
      `${this.apiHost}/api/usercategories/apply`,
      {
        mappings,
      },
      {
        headers,
      },
    );
  }
}
