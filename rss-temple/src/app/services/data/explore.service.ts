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

const ZFeedDescriptor = z.object({
  name: z.string(),
  feedUrl: z.string().url(),
  homeUrl: z.string().url().nullable(),
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
  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
  ) {}

  explore(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .get<unknown>(`${environment.envVar.API_HOST}/api/explore`, {
        headers,
      })
      .pipe(map(retObj => z.array(ZTagDescriptors).parse(retObj)));
  }
}
