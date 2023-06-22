import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { SessionService } from '@app/services/session.service';

import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
  ) {}

  createMyLogin(email: string, password: string) {
    return this.http.post<void>(`${environment.envVar.apiHost}/api/login/my`, {
      email,
      password,
    });
  }

  createGoogleLogin(email: string, password: string, token: string) {
    return this.http.post<void>(
      `${environment.envVar.apiHost}/api/login/google`,
      {
        email,
        password,
        token,
      },
    );
  }

  createFacebookLogin(email: string, password: string, token: string) {
    return this.http.post<void>(
      `${environment.envVar.apiHost}/api/login/facebook`,
      {
        email,
        password,
        token,
      },
    );
  }

  getMyLoginSession(email: string, password: string) {
    return this.http
      .post<string>(
        `${environment.envVar.apiHost}/api/login/my/session`,
        {
          email,
          password,
        },
        {
          responseType: 'json',
        },
      )
      .pipe(
        map(response => {
          /* istanbul ignore else */
          if (typeof response === 'string') {
            return response;
          } else {
            throw new Error('malformed response');
          }
        }),
      );
  }

  getGoogleLoginSession(user: gapi.auth2.GoogleUser) {
    return this.http
      .post<string>(
        `${environment.envVar.apiHost}/api/login/google/session`,
        {
          token: user.getAuthResponse().id_token,
        },
        {
          responseType: 'json',
        },
      )
      .pipe(
        map(response => {
          /* istanbul ignore else */
          if (typeof response === 'string') {
            return response;
          } else {
            throw new Error('malformed response');
          }
        }),
      );
  }

  getFacebookLoginSession(user: facebook.AuthResponse) {
    return this.http
      .post<string>(
        `${environment.envVar.apiHost}/api/login/facebook/session`,
        {
          token: user.accessToken,
        },
        {
          responseType: 'json',
        },
      )
      .pipe(
        map(response => {
          /* istanbul ignore else */
          if (typeof response === 'string') {
            return response;
          } else {
            throw new Error('malformed response');
          }
        }),
      );
  }

  deleteSessionToken(
    options: Required<Pick<CommonOptions, 'sessionToken'>> &
      Omit<CommonOptions, 'sessionToken'>,
  ) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http.delete<void>(`${environment.envVar.apiHost}/api/session`, {
      headers,
    });
  }
}
