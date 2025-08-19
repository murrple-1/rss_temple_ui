import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { ConfigService } from '@app/services/config.service';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { createCSRFTokenFnWithService } from '@app/services/data/csrftoken.lib';

const ZFeedDescriptor = z.object({
  name: z.string(),
  feedUrl: z.url(),
  homeUrl: z.url().nullable(),
  imageSrc: z.string().nullable(),
  entryTitles: z.array(z.string()),
  isSubscribed: z.boolean(),
});

const ZTagDescriptors = z.object({
  tagName: z.string(),
  feeds: z.array(ZFeedDescriptor),
});

@Injectable({
  providedIn: 'root',
})
export class ExploreService {
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

  explore(options: CommonOptions = {}) {
    const headers = commonToHeaders(
      options,
      createCSRFTokenFnWithService(this.cookieService),
    );

    return this.http
      .get<unknown>(`${this.apiHost}/api/explore`, {
        headers,
        withCredentials: true,
      })
      .pipe(map(retObj => z.array(ZTagDescriptors).parse(retObj)));
  }
}
