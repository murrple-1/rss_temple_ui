import { Injectable } from '@angular/core';
import { CookieOptions, CookieService, SameSite } from 'ngx-cookie-service';

@Injectable()
export class MockCookieService extends CookieService {
  constructor(public _cookieConfig: Record<string, string>) {
    super(document, {});
  }

  check(name: string) {
    return this._cookieConfig[name] !== undefined;
  }

  delete(
    name: string,
    path?: string | undefined,
    domain?: string | undefined,
    secure?: boolean | undefined,
    sameSite?: SameSite | undefined,
  ): void {
    delete this._cookieConfig[name];
  }

  get(name: string): string {
    const v = this._cookieConfig[name];
    if (v === undefined) {
      return '';
    } else {
      return v;
    }
  }

  getAll(): { [key: string]: string } {
    return this._cookieConfig;
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
    this._cookieConfig[name_] = value_;
  }

  deleteAll(
    path?: string | undefined,
    domain?: string | undefined,
    secure?: boolean | undefined,
    sameSite?: SameSite | undefined,
  ): void {
    this._cookieConfig = {};
  }
}
