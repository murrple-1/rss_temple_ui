import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { User } from '@app/_models';
import { sessionToken } from '@app/_modules/session.module';
import {
  GetOptions,
  toHeader as getToHeader,
  toParams as getToParams,
} from '@app/_services/data/get.interface';

import { environment } from '@environments/environment';
import { CommonOptions, toHeader } from './common.interface';

export type Field = keyof User;

function toUser(value: Record<string, any>) {
  const user = new User();

  if (value['uuid'] !== undefined) {
    const uuid = value['uuid'];
    if (typeof uuid === 'string') {
      user.uuid = uuid;
    } else {
      throw new Error("'uuid' must be string");
    }
  }

  if (value['email'] !== undefined) {
    const email = value['email'];
    if (typeof email === 'string') {
      user.email = email;
    } else {
      throw new Error("'email' must be string");
    }
  }

  if (value['hasGoogleLogin'] !== undefined) {
    const hasGoogleLogin = value['hasGoogleLogin'];
    if (typeof hasGoogleLogin === 'boolean') {
      user.hasGoogleLogin = hasGoogleLogin;
    } else {
      throw new Error("'hasGoogleLogin' must be boolean");
    }
  }

  if (value['hasFacebookLogin'] !== undefined) {
    const hasFacebookLogin = value['hasFacebookLogin'];
    if (typeof hasFacebookLogin === 'boolean') {
      user.hasFacebookLogin = hasFacebookLogin;
    } else {
      throw new Error("'hasFacebookLogin' must be boolean");
    }
  }

  if (value['subscribedFeedUuids'] !== undefined) {
    const subscribedFeedUuids = value['subscribedFeedUuids'];
    if (Array.isArray(subscribedFeedUuids)) {
      for (const element of subscribedFeedUuids) {
        if (typeof element !== 'string') {
          throw new Error("'subscribedFeedUuids' element must be string");
        }
      }

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
  } | null;
  facebook?: {
    token: string;
  } | null;
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

  verify(token: string) {
    const params: {
      [param: string]: string | string[];
    } = {
      token: token,
    };

    return this.http.post<void>(
      `${environment.apiHost}/api/user/verify`,
      undefined,
      {
        params: params,
      },
    );
  }
}
