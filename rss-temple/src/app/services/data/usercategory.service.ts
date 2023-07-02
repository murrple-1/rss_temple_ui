import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { UserCategory } from '@app/models';
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
  JsonObject,
  isJsonArray,
} from '@app/libs/json.lib';
import { AuthTokenService } from '@app/services/auth-token.service';

import { environment } from '@environments/environment';

export type Field = keyof UserCategory;
export type SortField = keyof UserCategory;

function toUserCategory(value: JsonValue) {
  if (!isJsonObject(value)) {
    throw new Error('JSON must be object');
  }

  const userCategory = new UserCategory();

  if (value.uuid !== undefined) {
    const uuid = value.uuid;
    if (typeof uuid === 'string') {
      userCategory.uuid = uuid;
    } else {
      throw new Error("'uuid' must be string");
    }
  }

  if (value.text !== undefined) {
    const text = value.text;
    if (typeof text === 'string') {
      userCategory.text = text;
    } else {
      throw new Error("'text' must be string");
    }
  }

  if (value.feedUuids !== undefined) {
    const feedUuids = value.feedUuids;
    if (isJsonArray(feedUuids)) {
      for (const feedUuid of feedUuids) {
        if (typeof feedUuid !== 'string') {
          throw new Error("'feedUuids' element must be string");
        }
      }

      userCategory.feedUuids = feedUuids as string[];
    } else {
      throw new Error("'feedUuids' must be array");
    }
  }

  return userCategory;
}

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
  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
  ) {}

  get(uuid: string, options: GetOptions<Field> = {}) {
    const headers = getToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = getToParams<Field>(options, () => ['uuid']);

    return this.http
      .get<JsonValue>(
        `${environment.envVar.API_HOST}/api/usercategory/${uuid}`,
        {
          headers,
          params,
        },
      )
      .pipe(map(toUserCategory));
  }

  query(options: QueryOptions<Field, SortField> = {}) {
    const headers = queryToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = queryToParams('usercategories');
    const body = queryToBody<Field, SortField>(options, () => ['uuid']);

    return this.http
      .post<JsonValue>(
        `${environment.envVar.API_HOST}/api/usercategories/query`,
        body,
        {
          headers,
          params,
        },
      )
      .pipe(map(retObj => toObjects(retObj, toUserCategory)));
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
      .post<JsonValue>(
        `${environment.envVar.API_HOST}/api/usercategory`,
        userCategoryJson,
        {
          headers,
          params,
          responseType: 'json',
        },
      )
      .pipe(map(toUserCategory));
  }

  delete(uuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.delete<void>(
      `${environment.envVar.API_HOST}/api/usercategory/${uuid}`,
      {
        headers,
      },
    );
  }

  apply(apply: IApply, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    const body: JsonObject = {};

    for (const [feedUuid, uuids] of Object.entries(apply)) {
      body[feedUuid] = Array.from(uuids);
    }

    return this.http.put<void>(
      `${environment.envVar.API_HOST}/api/usercategories/apply`,
      body,
      {
        headers,
      },
    );
  }
}
