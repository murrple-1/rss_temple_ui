import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { ZClassifierLabel } from '@app/models/classifierlabel';
import { AuthStateService } from '@app/services/auth-state.service';
import { ConfigService } from '@app/services/config.service';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';

const ZMultiClassifierLabels = z.object({
  classifierLabels: z.record(z.array(ZClassifierLabel)),
});

@Injectable({
  providedIn: 'root',
})
export class ClassifierLabelService {
  private readonly apiHost: string;

  constructor(
    private http: HttpClient,
    private authStateService: AuthStateService,
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
      this.authStateService.csrfToken$.getValue(),
    );
    const params: Record<string, string | string[]> = {};
    if (feedEntryUuid !== undefined) {
      params['feedEntryUuid'] = feedEntryUuid;
    }

    return this.http
      .get<unknown>(`${this.apiHost}/api/classifierlabels`, {
        headers,
        params,
        withCredentials: true,
      })
      .pipe(map(retObj => z.array(ZClassifierLabel).parse(retObj)));
  }

  getAllByEntry(feedEntryUuids: string[], options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authStateService.csrfToken$.getValue(),
    );
    const body = {
      feedEntryUuids,
    };

    return this.http
      .post<unknown>(`${this.apiHost}/api/classifierlabels/entries`, body, {
        headers,
        withCredentials: true,
      })
      .pipe(
        map(retObj => ZMultiClassifierLabels.parse(retObj).classifierLabels),
      );
  }

  getMyVotes(feedEntryUuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authStateService.csrfToken$.getValue(),
    );

    return this.http
      .get<unknown>(
        `${this.apiHost}/api/classifierlabels/votes/${feedEntryUuid}`,
        {
          headers,
          withCredentials: true,
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
      this.authStateService.csrfToken$.getValue(),
    );
    const body = {
      classifierLabelUuids,
    };

    return this.http.post<unknown>(
      `${this.apiHost}/api/classifierlabels/votes/${feedEntryUuid}`,
      body,
      {
        headers,
        withCredentials: true,
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
      this.authStateService.csrfToken$.getValue(),
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
        withCredentials: true,
      },
    );
  }
}
