import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import { ConfigService } from '@app/services/config.service';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { createCSRFTokenFnWithService } from '@app/services/data/csrftoken.lib';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
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

  reportFeed(feedUuid: string, reason: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    const body = {
      feedUuid,
      reason,
    };

    return this.http.post<unknown>(`${this.apiHost}/api/report/feed`, body, {
      headers,
      withCredentials: true,
    });
  }

  reportFeedEntry(
    feedEntryUuid: string,
    reason: string,
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    const body = {
      feedEntryUuid,
      reason,
    };

    return this.http.post<unknown>(
      `${this.apiHost}/api/report/feedentry`,
      body,
      {
        headers,
        withCredentials: true,
      },
    );
  }
}
