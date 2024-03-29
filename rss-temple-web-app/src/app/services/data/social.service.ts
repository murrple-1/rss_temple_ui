import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { ConfigService } from '@app/services/config.service';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { createCSRFTokenFnWithService } from '@app/services/data/csrftoken.lib';

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
  private readonly apiHost: string;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    configService: ConfigService,
  ) {
    const apiHost = configService.get<string>('apiHost');
    if (typeof apiHost !== 'string') {
      throw new Error('apiHost malformed');
    }

    this.apiHost = apiHost;
  }

  socialList(options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http
      .get<unknown>(`${this.apiHost}/api/social`, {
        headers,
        withCredentials: true,
      })
      .pipe(map(retObj => z.array(ZSocialItem).parse(retObj)));
  }

  googleLogin(token: string, stayLoggedIn: boolean) {
    return this.http
      .post<unknown>(
        `${this.apiHost}/api/social/google`,
        {
          access_token: token,
          stayLoggedIn,
        },
        {
          withCredentials: true,
        },
      )
      .pipe(map(retObj => ZSocialToken.parse(retObj)));
  }

  googleConnect(
    token: string,
    options: CommonOptions = {},
  ): Observable<string> {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http
      .post<unknown>(
        `${this.apiHost}/api/social/google/connect`,
        {
          access_token: token,
        },
        {
          headers,
          withCredentials: true,
        },
      )
      .pipe(map(retObj => ZSocialToken.parse(retObj).key));
  }

  googleDisconnect(options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http.post<void>(
      `${this.apiHost}/api/social/google/disconnect`,
      {},
      {
        headers,
        withCredentials: true,
      },
    );
  }

  facebookLogin(token: string, stayLoggedIn: boolean) {
    return this.http
      .post<unknown>(
        `${this.apiHost}/api/social/facebook`,
        {
          access_token: token,
          stayLoggedIn,
        },
        {
          withCredentials: true,
        },
      )
      .pipe(map(retObj => ZSocialToken.parse(retObj)));
  }

  facebookConnect(
    token: string,
    options: CommonOptions = {},
  ): Observable<string> {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http
      .post<unknown>(
        `${this.apiHost}/api/social/facebook/connect`,
        {
          access_token: token,
        },
        {
          headers,
          withCredentials: true,
        },
      )
      .pipe(map(retObj => ZSocialToken.parse(retObj).key));
  }

  facebookDisconnect(options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http.post<void>(
      `${this.apiHost}/api/social/facebook/disconnect`,
      {},
      {
        headers,
        withCredentials: true,
      },
    );
  }
}
