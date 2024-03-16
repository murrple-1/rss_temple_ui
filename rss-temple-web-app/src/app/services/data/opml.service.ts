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
export class OPMLService {
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

  download(options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http.get(`${this.apiHost}/api/opml`, {
      headers,
      responseType: 'text',
      withCredentials: true,
    });
  }

  upload(opmlText: string | ArrayBuffer, options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http.post(`${this.apiHost}/api/opml`, opmlText, {
      headers,
      observe: 'response',
      withCredentials: true,
    });
  }
}
