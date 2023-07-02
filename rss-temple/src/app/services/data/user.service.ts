import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { User } from '@app/models';
import {
  GetOptions,
  toHeaders as getToHeaders,
  toParams as getToParams,
} from '@app/services/data/get.interface';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import {
  JsonValue,
  isJsonObject,
  isJsonArray,
  JsonObject,
} from '@app/libs/json.lib';
import { AuthTokenService } from '@app/services/auth-token.service';

import { environment } from '@environments/environment';

export type Field = keyof User;

function toUser(value: JsonValue) {
  if (!isJsonObject(value)) {
    throw new Error('JSON must be object');
  }

  const user = new User();

  if (value.uuid !== undefined) {
    const uuid = value.uuid;
    if (typeof uuid === 'string') {
      user.uuid = uuid;
    } else {
      throw new Error("'uuid' must be string");
    }
  }

  if (value.email !== undefined) {
    const email = value.email;
    if (typeof email === 'string') {
      user.email = email;
    } else {
      throw new Error("'email' must be string");
    }
  }

  if (value.attributes !== undefined) {
    const attributes = value.attributes;
    if (isJsonObject(attributes)) {
      user.attributes = attributes;
    } else {
      throw new Error("'attributes' must be object");
    }
  }

  if (value.hasGoogleLogin !== undefined) {
    const hasGoogleLogin = value.hasGoogleLogin;
    if (typeof hasGoogleLogin === 'boolean') {
      user.hasGoogleLogin = hasGoogleLogin;
    } else {
      throw new Error("'hasGoogleLogin' must be boolean");
    }
  }

  if (value.hasFacebookLogin !== undefined) {
    const hasFacebookLogin = value.hasFacebookLogin;
    if (typeof hasFacebookLogin === 'boolean') {
      user.hasFacebookLogin = hasFacebookLogin;
    } else {
      throw new Error("'hasFacebookLogin' must be boolean");
    }
  }

  if (value.subscribedFeedUuids !== undefined) {
    const subscribedFeedUuids = value.subscribedFeedUuids;
    if (isJsonArray(subscribedFeedUuids)) {
      if (subscribedFeedUuids.some(elem => typeof elem !== 'string')) {
        throw new Error("'subscribedFeedUuids' element must be string");
      }

      user.subscribedFeedUuids = subscribedFeedUuids as string[];
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

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
  ) {}

  get(options: GetOptions<Field> = {}) {
    const headers = getToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params = getToParams<Field>(options, () => ['uuid']);

    return this.http
      .get<JsonValue>(`${environment.envVar.API_HOST}/api/user`, {
        headers,
        params,
      })
      .pipe(map(toUser));
  }

  update(body: UpdateUserBody, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.put<void>(
      `${environment.envVar.API_HOST}/api/user`,
      body,
      {
        headers,
      },
    );
  }

  verify(token: string) {
    const formData = new FormData();
    formData.append('token', token);

    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/user/verify`,
      formData,
    );
  }

  updateAttributes(attributes: JsonObject, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.put<void>(
      `${environment.envVar.API_HOST}/api/user/attributes`,
      attributes,
      {
        headers,
      },
    );
  }
}
