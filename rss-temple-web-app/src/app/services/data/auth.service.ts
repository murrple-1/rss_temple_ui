import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { ZUser } from '@app/models/user';
import { AuthStateService } from '@app/services/auth-state.service';
import { ConfigService } from '@app/services/config.service';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';

const ZLoginResponse = z.object({
  key: z.string(),
});

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiHost: string;

  constructor(
    private http: HttpClient,
    private authStateService: AuthStateService,
    configService: ConfigService,
  ) {
    const apiHost = configService.get<string>('apiHost');
    if (typeof apiHost !== 'string') {
      throw new Error('apiHost malformed');
    }

    this.apiHost = apiHost;
  }

  login(
    email: string,
    password: string,
  ): Observable<{
    authToken: string;
    csrfToken: string;
  }> {
    return this.http
      .post<unknown>(
        `${this.apiHost}/api/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
          observe: 'response',
        },
      )
      .pipe(
        map(response => {
          const csrfToken = response.headers.get('X-CSRFToken');
          if (csrfToken === null) {
            throw new Error('csrfToken null');
          }
          return {
            authToken: ZLoginResponse.parse(response.body).key,
            csrfToken,
          };
        }),
      );
  }

  logout(
    options: Required<Pick<CommonOptions, 'csrfToken'>> &
      Omit<CommonOptions, 'csrfToken'>,
  ) {
    const headers = commonToHeaders(options, () =>
      this.authStateService.csrfToken$.getValue(),
    );

    return this.http.post<void>(`${this.apiHost}/api/auth/logout`, undefined, {
      headers,
      withCredentials: true,
    });
  }

  changePassword(
    oldPassword: string,
    newPassword: string,
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(options, () =>
      this.authStateService.csrfToken$.getValue(),
    );

    return this.http.post<void>(
      `${this.apiHost}/api/auth/password/change`,
      {
        oldPassword,
        newPassword,
      },
      {
        responseType: 'json',
        headers,
        withCredentials: true,
      },
    );
  }

  requestPasswordReset(email: string) {
    return this.http.post<void>(`${this.apiHost}/api/auth/password/reset`, {
      email,
    });
  }

  resetPassword(token: string, userUuid: string, password: string) {
    return this.http.post<void>(
      `${this.apiHost}/api/auth/password/reset/confirm`,
      {
        userUuid,
        token,
        newPassword: password,
      },
    );
  }

  getUser(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authStateService.csrfToken$.getValue(),
    );

    return this.http
      .get<unknown>(`${this.apiHost}/api/auth/user`, {
        headers,
        withCredentials: true,
      })
      .pipe(map(retObj => ZUser.parse(retObj)));
  }

  updateUserAttributes(
    attributes: Record<string, unknown>,
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(options, () =>
      this.authStateService.csrfToken$.getValue(),
    );

    return this.http.put<void>(
      `${this.apiHost}/api/auth/user/attributes`,
      attributes,
      {
        headers,
        withCredentials: true,
      },
    );
  }

  deleteUser(password: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authStateService.csrfToken$.getValue(),
    );

    return this.http.post<void>(
      `${this.apiHost}/api/auth/user/delete`,
      {
        password,
      },
      {
        headers,
        withCredentials: true,
      },
    );
  }
}
