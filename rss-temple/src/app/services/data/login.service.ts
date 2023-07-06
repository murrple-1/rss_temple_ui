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
import { Observable } from 'rxjs';

const ZLoginResponse = z.object({
  key: z.string(),
});

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
  ) {}

  register(email: string, password: string) {
    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/registration`,
      {
        email,
        password1: password,
        password2: password,
      },
    );
  }

  createGoogleLogin(
    email: string,
    password: string,
    token: string,
  ): Observable<void> {
    throw new Error('TODO reimplement');
  }

  createFacebookLogin(
    email: string,
    password: string,
    token: string,
  ): Observable<void> {
    throw new Error('TODO reimplement');
  }

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

  getGoogleLoginSession(user: gapi.auth2.GoogleUser): Observable<string> {
    throw new Error('TODO reimplement');
  }

  getFacebookLoginSession(user: facebook.AuthResponse): Observable<string> {
    throw new Error('TODO reimplement');
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
}
