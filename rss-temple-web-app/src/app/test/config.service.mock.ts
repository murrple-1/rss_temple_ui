import { Injectable, InjectionToken, inject } from '@angular/core';

import { ConfigService } from '@app/services/config.service';

export const MOCK_CONFIG_SERVICE_CONFIG = new InjectionToken<
  Record<string, unknown>
>('MOCK_CONFIG_SERVICE_CONFIG', {
  providedIn: 'root',
  factory: () => ({}),
});

@Injectable()
export class MockConfigService extends ConfigService {
  private mockConfig = inject(MOCK_CONFIG_SERVICE_CONFIG);

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
