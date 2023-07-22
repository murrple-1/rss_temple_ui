import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { z } from 'zod';

import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { AuthTokenService } from '@app/services/auth-token.service';

import { environment } from '@environments/environment';

const ZSocialToken = z.object({
  key: z.string(),
});

const ZSocialItem = z
  .object({
    id: z.number(),
    date_joined: z
      .union([z.string().datetime({ offset: true }), z.date()])
      .transform(arg => new Date(arg)),
    last_login: z
      .union([z.string().datetime({ offset: true }), z.date()])
      .transform(arg => new Date(arg)),
    provider: z.string(),
    uid: z.string(),
  })
  .transform(arg => ({
    id: arg.id,
    dateJoined: arg.date_joined,
    lastLogin: arg.last_login,
    provider: arg.provider,
    uid: arg.uid,
  }));

@Injectable({
  providedIn: 'root',
})
export class SocialService {
  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
  ) {}

  socialList(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .get<unknown>(`${environment.envVar.API_HOST}/api/social`, {
        headers,
      })
      .pipe(map(retObj => z.array(ZSocialItem).parse(retObj)));
  }

  googleLogin(token: string): Observable<string> {
    return this.http
      .post<unknown>(`${environment.envVar.API_HOST}/api/social/google`, {
        access_token: token,
      })
      .pipe(map(retObj => ZSocialToken.parse(retObj).key));
  }

  googleConnect(
    token: string,
    options: CommonOptions = {},
  ): Observable<string> {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .post<unknown>(
        `${environment.envVar.API_HOST}/api/social/google/connect`,
        {
          access_token: token,
        },
        {
          headers,
        },
      )
      .pipe(map(retObj => ZSocialToken.parse(retObj).key));
  }

  googleDisconnect(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/social/google/disconnect`,
      {},
      {
        headers,
      },
    );
  }

  facebookLogin(token: string): Observable<string> {
    return this.http
      .post<unknown>(`${environment.envVar.API_HOST}/api/social/facebook`, {
        access_token: token,
      })
      .pipe(map(retObj => ZSocialToken.parse(retObj).key));
  }

  facebookConnect(
    token: string,
    options: CommonOptions = {},
  ): Observable<string> {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .post<unknown>(
        `${environment.envVar.API_HOST}/api/social/facebook/connect`,
        {
          access_token: token,
        },
        {
          headers,
        },
      )
      .pipe(map(retObj => ZSocialToken.parse(retObj).key));
  }

  facebookDisconnect(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/social/facebook/disconnect`,
      {},
      {
        headers,
      },
    );
  }
}
