import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import {
  CommonOptions,
  toHeader as commonToHeader,
} from '@app/services/data/common.interface';
import { sessionToken } from '@app/libs/session.lib';

@Injectable()
export class LoginService {
  constructor(private http: HttpClient) {}

  createMyLogin(email: string, password: string) {
    return this.http.post<void>(`${environment.apiHost}/api/login/my`, {
      email: email,
      password: password,
    });
  }

  createGoogleLogin(email: string, password: string, token: string) {
    return this.http.post<void>(`${environment.apiHost}/api/login/google`, {
      email: email,
      password: password,
      token: token,
    });
  }

  createFacebookLogin(email: string, password: string, token: string) {
    return this.http.post<void>(`${environment.apiHost}/api/login/facebook`, {
      email: email,
      password: password,
      token: token,
    });
  }

  getMyLoginSession(email: string, password: string) {
    return this.http.post<string | Object>(
      `${environment.apiHost}/api/login/my/session`,
      {
        email: email,
        password: password,
      },
      {
        responseType: 'json',
      },
    );
  }

  getGoogleLoginSession(user: gapi.auth2.GoogleUser) {
    return this.http.post<string | Object>(
      `${environment.apiHost}/api/login/google/session`,
      {
        token: user.getAuthResponse().id_token,
      },
      {
        responseType: 'json',
      },
    );
  }

  getFacebookLoginSession(user: facebook.AuthResponse) {
    return this.http.post<string | Object>(
      `${environment.apiHost}/api/login/facebook/session`,
      {
        token: user.accessToken,
      },
      {
        responseType: 'json',
      },
    );
  }

  deleteSessionToken(options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http.delete<void>(`${environment.apiHost}/api/session`, {
      headers: headers,
    });
  }
}
