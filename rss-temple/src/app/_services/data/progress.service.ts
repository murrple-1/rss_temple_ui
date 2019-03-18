import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

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

function toProgressInterface(value: Record<string, any>): ProgressInterface {
  if (value['state'] === undefined) {
    throw new Error("'state' missing");
  }

  if (!['notstarted', 'started', 'finished'].includes(value['state'])) {
    throw new Error("'state' malformed");
  }

  if (value['totalCount'] === undefined) {
    throw new Error("'totalCount' missing");
  }

  if (typeof value['totalCount'] !== 'number') {
    throw new Error("'totalCount' must be number");
  }

  if (value['finishedCount'] === undefined) {
    throw new Error("'finishedCount' missing");
  }

  if (typeof value['finishedCount'] !== 'number') {
    throw new Error("'finishedCount' must be number");
  }

  return value as ProgressInterface;
}

@Injectable()
export class ProgressService {
  constructor(private http: HttpClient) {}

  checkProgress(uuid: string, options: CommonOptions = {}) {
    const headers = commonToHeader(options, sessionToken);

    return this.http
      .get(`${environment.apiHost}/api/feed/subscribe/progress/${uuid}`, {
        headers: headers,
      })
      .pipe(map(toProgressInterface));
  }
}
