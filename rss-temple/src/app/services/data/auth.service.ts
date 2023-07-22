import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { z } from 'zod';

import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { AuthTokenService } from '@app/services/auth-token.service';

import { environment } from '@environments/environment';
import { ZUser } from '@app/models/user';

const ZLoginResponse = z.object({
  key: z.string(),
});

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
  ) {}
  login(email: string, password: string) {
    return this.http
      .post<unknown>(
        `${environment.envVar.API_HOST}/api/auth/login`,
        {
          email,
          password,
        },
        {
          responseType: 'json',
        },
      )
      .pipe(map(retObj => ZLoginResponse.parse(retObj)));
  }

  logout(
    options: Required<Pick<CommonOptions, 'authToken'>> &
      Omit<CommonOptions, 'authToken'>,
  ) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/auth/logout`,
      undefined,
      {
        headers,
      },
    );
  }

  changePassword(password: string) {
    // TODO finish
    return this.http
      .post<unknown>(
        `${environment.envVar.API_HOST}/api/auth/password/change`,
        {},
        {
          responseType: 'json',
        },
      )
      .pipe(map(retObj => undefined));
  }

  requestPasswordReset(email: string) {
    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/auth/password/reset`,
      {
        email,
      },
    );
  }

  resetPassword(token: string, userId: string, password: string) {
    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/auth/password/reset/confirm`,
      {
        uid: userId,
        token,
        new_password1: password,
        new_password2: password,
      },
    );
  }

  getUser(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .get<unknown>(`${environment.envVar.API_HOST}/api/auth/user`, {
        headers,
      })
      .pipe(map(retObj => ZUser.parse(retObj)));
  }

  updateUserAttributes(
    attributes: Record<string, unknown>,
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.put<void>(
      `${environment.envVar.API_HOST}/api/auth/user/attributes`,
      attributes,
      {
        headers,
      },
    );
  }
}
