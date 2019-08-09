import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { sessionToken } from '@app/libs/session.lib';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { JsonValue, isJsonObject } from '@app/libs/json.lib';

import { environment } from '@environments/environment';

export interface ProgressInterface {
  state: 'notstarted' | 'started' | 'finished';
  totalCount: number;
  finishedCount: number;
}

function toProgressInterface(value: JsonValue): ProgressInterface {
  if (!isJsonObject(value)) {
    throw new Error('JSON must be object');
  }

  if (value.state === undefined) {
    throw new Error("'state' missing");
  }

  const state = value.state;
  if (typeof state !== 'string') {
    throw new Error("'state' must be string");
  }

  if (!['notstarted', 'started', 'finished'].includes(state)) {
    throw new Error("'state' malformed");
  }

  if (value.totalCount === undefined) {
    throw new Error("'totalCount' missing");
  }

  if (typeof value.totalCount !== 'number') {
    throw new Error("'totalCount' must be number");
  }

  if (value.finishedCount === undefined) {
    throw new Error("'finishedCount' missing");
  }

  if (typeof value.finishedCount !== 'number') {
    throw new Error("'finishedCount' must be number");
  }

  return (value as unknown) as ProgressInterface;
}

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  constructor(private http: HttpClient) {}

  checkProgress(uuid: string, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http
      .get<JsonValue>(
        `${environment.apiHost}/api/feed/subscribe/progress/${uuid}`,
        { headers },
      )
      .pipe(map(toProgressInterface));
  }
}
