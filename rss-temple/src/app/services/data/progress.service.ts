import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { z } from 'zod';

import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { AuthTokenService } from '@app/services/auth-token.service';
import { ConfigService } from '@app/services/config.service';

const ZProgressInterface = z.object({
  state: z.enum(['notstarted', 'started', 'finished']),
  totalCount: z.number(),
  finishedCount: z.number(),
});

export type ProgressInterface = z.infer<typeof ZProgressInterface>;

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
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

  checkProgress(uuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .get<unknown>(`${this.apiHost}/api/feed/subscribe/progress/${uuid}`, {
        headers,
      })
      .pipe(map(retObj => ZProgressInterface.parse(retObj)));
  }
}
