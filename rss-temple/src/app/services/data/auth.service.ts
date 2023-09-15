import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { ZUser } from '@app/models/user';
import { AuthTokenService } from '@app/services/auth-token.service';
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
    private authTokenService: AuthTokenService,
    configService: ConfigService,
  ) {
    const apiHost = configService.get<string>('apiHost');
    if (typeof apiHost !== 'string') {
      throw new Error('apiHost malformed');
    }

    this.apiHost = apiHost;
  }

  login(email: string, password: string) {
    return this.http
      .post<unknown>(
        `${this.apiHost}/api/auth/login`,
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

    return this.http.post<void>(`${this.apiHost}/api/auth/logout`, undefined, {
      headers,
    });
  }

  changePassword(
    oldPassword: string,
    newPassword: string,
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
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
      },
    );
  }

  requestPasswordReset(email: string) {
    return this.http.post<void>(`${this.apiHost}/api/auth/password/reset`, {
      email,
    });
  }

  resetPassword(token: string, userId: string, password: string) {
    return this.http.post<void>(
      `${this.apiHost}/api/auth/password/reset/confirm`,
      {
        uid: userId,
        token,
        newPassword: password,
      },
    );
  }

  getUser(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .get<unknown>(`${this.apiHost}/api/auth/user`, {
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
      `${this.apiHost}/api/auth/user/attributes`,
      attributes,
      {
        headers,
      },
    );
  }
}
