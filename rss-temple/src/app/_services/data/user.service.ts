import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { User } from '@app/_models/user';
import { sessionToken } from '@app/_modules/session.module';
import {
  GetOptions,
  toHeader as getToHeader,
  toParams as getToParams,
} from '@app/_services/data/get.interface';

import { environment } from '@environments/environment';
import { CommonOptions, toHeader } from './common.interface';

export type Field = 'uuid' | 'email' | 'subscribedFeedUuids';

function toUser(value: Object) {
  const user = new User();

  if (value.hasOwnProperty('uuid')) {
    const uuid = value['uuid'];
    if (typeof uuid === 'string') {
      user.uuid = uuid;
    } else {
      throw new Error("'uuid' must be string");
    }
  }

  if (value.hasOwnProperty('email')) {
    const email = value['email'];
    if (typeof email === 'string') {
      user.email = email;
    } else {
      throw new Error("'email' must be string");
    }
  }

  if (value.hasOwnProperty('subscribedFeedUuids')) {
    const subscribedFeedUuids = value['subscribedFeedUuids'];
    if (Array.isArray(subscribedFeedUuids)) {
      subscribedFeedUuids.forEach(element => {
        if (typeof element !== 'string') {
          throw new Error("'subscribedFeedUuids' element must be string");
        }
      });

      user.subscribedFeedUuids = value['subscribedFeedUuids'];
    } else {
      throw new Error("'subscribedFeedUuids' must be array");
    }
  }

  return user;
}

export interface UpdateUserBody {
  email?: string;
  my?: {
    password?: {
      old: string;
      new: string;
    };
  };
  google?: {
    token?: string;
  };
  facebook?: {
    token: string;
  };
}

@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}

  get(options: GetOptions<Field> = {}) {
    const headers = getToHeader(options, sessionToken);
    const params = getToParams(options, () => ['uuid']);

    return this.http
      .get(`${environment.apiHost}/api/user`, {
        headers: headers,
        params: params,
      })
      .pipe<User>(map(toUser));
  }

  update(body: UpdateUserBody, options: CommonOptions = {}) {
    const headers = toHeader(options, sessionToken);

    return this.http.put<void>(`${environment.apiHost}/api/user`, body, {
      headers: headers,
    });
  }
}
