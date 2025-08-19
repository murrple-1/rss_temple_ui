import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config?: Record<string, unknown>;

  constructor(private http: HttpClient) {}

  async load() {
    await firstValueFrom(this.http.get<unknown>('/assets/config.json')).then(
      retVal => {
        const config = z.record(z.string(), z.unknown()).parse(retVal);
        this.config = config;
      },
    );
  }

  get<T = unknown>(key: string): T | undefined {
    return this.config?.[key] as T | undefined;
  }

  getMany<T = unknown>(...keys: string[]): (T | undefined)[] {
    return keys.map(key => this.config?.[key] as T | undefined);
  }
}
