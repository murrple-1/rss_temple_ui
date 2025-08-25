import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { ConfigService } from '@app/services/config.service';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { createCSRFTokenFnWithService } from '@app/services/data/csrftoken.lib';

@Injectable({
  providedIn: 'root',
})
export class UserMetaService {
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);

  private readonly apiHost: string;

  constructor() {
    const configService = inject(ConfigService);

    const apiHost = configService.get<string>('apiHost');
    if (typeof apiHost !== 'string') {
      throw new Error('apiHost malformed');
    }

    this.apiHost = apiHost;
  }

  getReadCount(options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http
      .get<unknown>(`${this.apiHost}/api/user/meta/readcount`, {
        headers,
        withCredentials: true,
      })
      .pipe(map(retObj => z.number().parse(retObj)));
  }
}
