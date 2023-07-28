import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { z } from 'zod';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config?: Record<string, unknown>;

  constructor(private http: HttpClient) {}

  async load() {
    await this.http
      .get<unknown>('/assets/config.json', {
        responseType: 'json',
      })
      .toPromise()
      .then(retVal => {
        const config = z.record(z.unknown()).parse(retVal);
        this.config = config;
      });
  }

  get<T = unknown>(key: string): T | undefined {
    return this.config?.[key] as T | undefined;
  }

  getMany<T = unknown>(...keys: string[]): (T | undefined)[] {
    return keys.map(key => this.config?.[key] as T | undefined);
  }
}
