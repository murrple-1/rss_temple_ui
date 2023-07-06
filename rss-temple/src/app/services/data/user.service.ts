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
import { AuthTokenService } from '@app/services/auth-token.service';

import { environment } from '@environments/environment';
import { ZUser } from '@app/models/user';
import { Observable } from 'rxjs';

export type Field = keyof User;

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
      .get<unknown>(`${environment.envVar.API_HOST}/api/user`, {
        headers,
        params,
      })
      .pipe(map(retObj => ZUser.parse(retObj)));
  }

  update(body: UpdateUserBody, options: CommonOptions = {}): Observable<void> {
    throw new Error('TODO reimplement');
  }

  verify(key: string) {
    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/registration/verify-email`,
      {
        key,
      },
    );
  }

  updateAttributes(
    attributes: Record<string, unknown>,
    options: CommonOptions = {},
  ) {
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
