import { Injectable, InjectionToken, inject } from '@angular/core';
import { CookieOptions, CookieService, SameSite } from 'ngx-cookie-service';

export const MOCK_COOKIE_SERVICE_CONFIG = new InjectionToken<
  Record<string, string>
>('MOCK_COOKIE_SERVICE_CONFIG', {
  providedIn: 'root',
  factory: () => ({}),
});

@Injectable()
export class MockCookieService extends CookieService {
  mockConfig = inject(MOCK_COOKIE_SERVICE_CONFIG);

  check(name: string) {
    return this.mockConfig[name] !== undefined;
  }

  delete(
    name: string,
    path?: string | undefined,
    domain?: string | undefined,
    secure?: boolean | undefined,
    sameSite?: SameSite | undefined,
  ): void {
    delete this.mockConfig[name];
  }

  get(name: string): string {
    const v = this.mockConfig[name];
    if (v === undefined) {
      return '';
    } else {
      return v;
    }
  }

  getAll(): { [key: string]: string } {
    return this.mockConfig;
  }

  set(
    name: string,
    value: string,
    expires?: number | Date | undefined,
    path?: string | undefined,
    domain?: string | undefined,
    secure?: boolean | undefined,
    sameSite?: SameSite | undefined,
    partitioned?: boolean | undefined,
  ): void;
  set(name: string, value: string, options?: CookieOptions | undefined): void;
  set(
    name: unknown,
    value: unknown,
    expires?: unknown,
    path?: unknown,
    domain?: unknown,
    secure?: unknown,
    sameSite?: unknown,
    partitioned?: unknown,
  ): void {
    let name_: string;
    if (typeof name !== 'string') {
      name_ = String(name);
    } else {
      name_ = name;
    }

    let value_: string;
    if (typeof value !== 'string') {
      value_ = String(value);
    } else {
      value_ = value;
    }
    this.mockConfig[name_] = value_;
  }

  deleteAll(
    path?: string | undefined,
    domain?: string | undefined,
    secure?: boolean | undefined,
    sameSite?: SameSite | undefined,
  ): void {
    this.mockConfig = {};
  }
}
