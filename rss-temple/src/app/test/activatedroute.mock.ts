import {
  ParamMap,
  ActivatedRoute,
  UrlSegment,
  Params,
  Route,
  Data,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Type } from '@angular/core';

import { Observable } from 'rxjs';

class MockParamMap implements ParamMap {
  _map = new Map<string, string>();

  get keys(): string[] {
    return Array.from(this._map.keys());
  }

  has(_name: string): boolean {
    throw new Error('Method not implemented.');
  }

  get(name: string): string | null {
    const value = this._map.get(name);
    if (value !== undefined) {
      return value;
    } else {
      return null;
    }
  }

  getAll(_name: string): string[] {
    throw new Error('Method not implemented.');
  }
}

class MockActivatedRouteSnapshot extends ActivatedRouteSnapshot {
  url: UrlSegment[] = [];
  params: Params = {};
  queryParams: Params = {};
  fragment = '';
  data: Data = {};
  outlet = '';
  component: Type<any> | null = null;
  routeConfig: Route | null = null;

  _paramMap = new MockParamMap();

  get paramMap(): ParamMap {
    return this._paramMap;
  }
}

export class MockActivatedRoute extends ActivatedRoute {
  url = new Observable<UrlSegment[]>(_subscriber => {});
  params = new Observable<Params>(_subscriber => {});
  queryParams = new Observable<Params>(_subscriber => {});
  fragment = new Observable<string>(_subscriber => {});
  data = new Observable<Data>(_subscriber => {});
  outlet = '';
  component: Type<any> | null = null;
  snapshot = new MockActivatedRouteSnapshot();
}
