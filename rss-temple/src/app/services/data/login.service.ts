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
  expiry: z
    .string()
    .datetime()
    .transform(arg => new Date(arg)),
  token: z.string(),
});

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
  ) {}

  createMyLogin(email: string, password: string) {
    return this.http.post<void>(`${environment.envVar.API_HOST}/api/login/my`, {
      email,
      password,
    });
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

  getMyLoginSession(email: string, password: string) {
    const authorization = `${email}:${password}`;
    const headers: Record<string, string | string[]> = {
      'Authorization': `Basic ${btoa(authorization)}`,
    };
    return this.http
      .post<unknown>(`${environment.envVar.API_HOST}/api/login`, undefined, {
        responseType: 'json',
        headers,
      })
      .pipe(map(retObj => ZLoginResponse.parse(retObj)));
  }

  getGoogleLoginSession(user: gapi.auth2.GoogleUser): Observable<string> {
    throw new Error('TODO reimplement');
  }

  getFacebookLoginSession(user: facebook.AuthResponse): Observable<string> {
    throw new Error('TODO reimplement');
  }

  // TODO rename to logout
  deleteSessionToken(
    options: Required<Pick<CommonOptions, 'authToken'>> &
      Omit<CommonOptions, 'authToken'>,
  ) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/logout`,
      undefined,
      {
        headers,
      },
    );
  }
}
