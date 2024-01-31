import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '@app/services/config.service';

@Injectable()
export class MockConfigService extends ConfigService {
  constructor(private mockConfig: Record<string, unknown>) {
    super(undefined as unknown as HttpClient);
  }

  async load() {
    // do nothing
  }

  get<T = unknown>(key: string): T | undefined {
    return this.mockConfig[key] as T | undefined;
  }

  getMany<T = unknown>(...keys: string[]): (T | undefined)[] {
    return keys.map(key => this.mockConfig[key] as T | undefined);
  }
}
