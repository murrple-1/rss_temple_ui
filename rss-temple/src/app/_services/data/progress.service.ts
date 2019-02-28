import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { sessionToken } from '@app/_modules/session.module';
import {
  CommonOptions,
  toHeader as commonToHeader,
} from '@app/_services/data/common.interface';

import { environment } from '@environments/environment';

export interface ProgressInterface {
  state: 'notstarted' | 'started' | 'finished';
  totalCount: number;
  finishedCount: number;
}

@Injectable()
export class ProgressService {
  constructor(private http: HttpClient) {}

  checkProgress(uuid: string, options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http.get<ProgressInterface>(
      `${environment.apiHost}/api/feed/subscribe/progress/${uuid}`,
      {
        headers: headers,
      },
    );
  }
}
