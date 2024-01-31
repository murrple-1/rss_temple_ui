import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { ZClassifierLabel } from '@app/models/classifierlabel';
import { AuthTokenService } from '@app/services/auth-token.service';
import { ConfigService } from '@app/services/config.service';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';

@Injectable({
  providedIn: 'root',
})
export class ClassifierLabelService {
  private readonly apiHost: string;

  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
    configService: ConfigService,
  ) {
    const apiHost = configService.get<string>('apiHost');
    if (typeof apiHost !== 'string') {
      throw new Error('apiHost malformed');
    }

    this.apiHost = apiHost;
  }

  getAll(feedEntryUuid: string | undefined, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const params: Record<string, string | string[]> = {};
    if (feedEntryUuid !== undefined) {
      params['feedEntryUuid'] = feedEntryUuid;
    }

    return this.http
      .get<unknown>(`${this.apiHost}/api/classifierlabels`, {
        headers,
        params,
      })
      .pipe(map(retObj => z.array(ZClassifierLabel).parse(retObj)));
  }

  getMyVotes(feedEntryUuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .get<unknown>(
        `${this.apiHost}/api/classifierlabels/votes/${feedEntryUuid}`,
        {
          headers,
        },
      )
      .pipe(map(retObj => z.array(ZClassifierLabel).parse(retObj)));
  }

  vote(
    feedEntryUuid: string,
    classifierLabelUuids: string[],
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );
    const body = {
      classifierLabelUuids,
    };

    return this.http.post<unknown>(
      `${this.apiHost}/api/classifierlabels/votes/${feedEntryUuid}`,
      body,
      {
        headers,
      },
    );
  }

  getAllMyVotes(
    queryOptions: {
      count?: number;
      skip?: number;
    },
    options: CommonOptions = {},
  ) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    const params: Record<string, string | string[]> = {};
    if (queryOptions.count !== undefined) {
      params['count'] = queryOptions.count.toString(10);
    }
    if (queryOptions.skip !== undefined) {
      params['skip'] = queryOptions.skip.toString(10);
    }

    return this.http.get<unknown>(
      `${this.apiHost}/api/classifierlabels/votes`,
      {
        headers,
        params,
      },
    );
  }
}
