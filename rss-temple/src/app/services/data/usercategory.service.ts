import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { UserCategory } from '@app/models';
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
import {
  JsonValue,
  isJsonObject,
  JsonObject,
} from '@app/services/data/json.type';

import { environment } from '@environments/environment';

export type Field = keyof UserCategory;
export type SortField = keyof UserCategory;

function toUserCategory(value: JsonValue) {
  if (!isJsonObject(value)) {
    throw new Error('JSON must be object');
  }

  const userCategory = new UserCategory();

  if (value['uuid'] !== undefined) {
    const uuid = value['uuid'];
    if (typeof uuid === 'string') {
      userCategory.uuid = uuid;
    } else {
      throw new Error("'uuid' must be string");
    }
  }

  if (value['text'] !== undefined) {
    const text = value['text'];
    if (typeof text === 'string') {
      userCategory.text = text;
    } else {
      throw new Error("'text' must be string");
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

@Injectable()
export class UserCategoryService {
  constructor(private http: HttpClient) {}

  get(uuid: string, options: GetOptions<Field> = {}) {
    const headers = getToHeaders(options, sessionToken);
    const params = getToParams(options, () => ['uuid']);

    return this.http
      .get<JsonValue>(`${environment.apiHost}/api/usercategory/${uuid}`, {
        headers: headers,
        params: params,
      })
      .pipe(map(toUserCategory));
  }

  query(options: QueryOptions<Field, SortField> = {}) {
    const headers = queryToHeaders(options, sessionToken);
    const body = queryToBody(options, () => ['uuid']);

    return this.http
      .post<JsonValue>(
        `${environment.apiHost}/api/usercategories/query`,
        body,
        {
          headers: headers,
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
    const headers = getToHeaders(options, sessionToken);

    const params = getToParams(options, () => ['uuid']);

    return this.http
      .post<JsonValue>(
        `${environment.apiHost}/api/usercategory`,
        userCategoryJson,
        {
          headers: headers,
          params: params,
          responseType: 'json',
        },
      )
      .pipe(map(toUserCategory));
  }

  delete(userCategoryUuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.delete<void>(
      `${environment.apiHost}/api/usercategory/${userCategoryUuid}`,
      {
        headers: headers,
      },
    );
  }

  apply(apply: IApply, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    const body: JsonObject = {};

    for (const feedUuid of Object.keys(apply)) {
      body[feedUuid] = Array.from(apply[feedUuid]);
    }

    return this.http.put<void>(
      `${environment.apiHost}/api/usercategories/apply`,
      body,
      {
        headers: headers,
      },
    );
  }
}
