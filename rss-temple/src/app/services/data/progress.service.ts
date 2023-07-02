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
  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
  ) {}

  checkProgress(uuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .get<unknown>(
        `${environment.envVar.API_HOST}/api/feed/subscribe/progress/${uuid}`,
        { headers },
      )
      .pipe(map(retObj => ZProgressInterface.parse(retObj)));
  }
}
