import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { UserCategory } from '@app/_models';
import { sessionToken } from '@app/_modules/session.module';
import { Objects, toObjects } from '@app/_services/data/objects';
import {
  GetOptions,
  toHeader as getToHeader,
  toParams as getToParams,
} from '@app/_services/data/get.interface';
import {
  QueryOptions,
  toHeader as queryToHeader,
  toBody as queryToBody,
} from '@app/_services/data/query.interface';
import { AllOptions } from '@app/_services/data/all.interface';
import { queryAllFn } from '@app/_services/data/queryall.function';
import {
  CommonOptions,
  toHeader as commonToHeader,
} from '@app/_services/data/common.interface';

import { environment } from '@environments/environment';

export type Field = keyof UserCategory;

function toUserCategory(value: Record<string, any>) {
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

@Injectable()
export class UserCategoryService {
  constructor(private http: HttpClient) {}

  get(uuid: string, options: GetOptions<Field> = {}) {
    const headers = getToHeader(options, sessionToken);
    const params = getToParams(options, () => ['uuid']);

    return this.http
      .get(`${environment.apiHost}/api/usercategory/${uuid}`, {
        headers: headers,
        params: params,
      })
      .pipe<UserCategory>(map(toUserCategory));
  }

  query(options: QueryOptions<Field> = {}) {
    const headers = queryToHeader(options, sessionToken);
    const body = queryToBody(options, () => ['uuid']);

    return this.http
      .post(`${environment.apiHost}/api/usercategories/query`, body, {
        headers: headers,
      })
      .pipe<Objects<UserCategory>>(
        map(retObj => toObjects<UserCategory>(retObj, toUserCategory)),
      );
  }

  queryAll(options: AllOptions<Field> = {}, pageSize = 1000) {
    return queryAllFn(options, this.query.bind(this), toUserCategory, pageSize);
  }

  create(userCategoryJson: ICreateUserCategory, options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http
      .post(`${environment.apiHost}/api/usercategory`, userCategoryJson, {
        headers: headers,
        responseType: 'json',
      })
      .pipe<UserCategory>(map(toUserCategory));
  }
}
