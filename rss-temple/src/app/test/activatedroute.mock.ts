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

  has(name: string): boolean {
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

  getAll(name: string): string[] {
    throw new Error('Method not implemented.');
  }
}

class MockActivatedRouteSnapshot implements ActivatedRouteSnapshot {
  url: UrlSegment[] = [];
  params: Params = {};
  queryParams: Params = {};
  fragment = '';
  data: Data = {};
  outlet = '';
  component: string | Type<any> | null = null;
  routeConfig: Route | null = null;

  _paramMap = new MockParamMap();

  get root(): ActivatedRouteSnapshot {
    throw new Error('Method not implemented.');
  }

  get parent(): ActivatedRouteSnapshot | null {
    throw new Error('Method not implemented.');
  }

  get firstChild(): ActivatedRouteSnapshot | null {
    throw new Error('Method not implemented.');
  }

  get children(): ActivatedRouteSnapshot[] {
    throw new Error('Method not implemented.');
  }

  get pathFromRoot(): ActivatedRouteSnapshot[] {
    throw new Error('Method not implemented.');
  }

  get paramMap(): ParamMap {
    return this._paramMap;
  }

  get queryParamMap(): ParamMap {
    throw new Error('Method not implemented.');
  }

  toString(): string {
    throw new Error('Method not implemented.');
  }
}

export class MockActivatedRoute implements ActivatedRoute {
  url = new Observable<UrlSegment[]>(_subscriber => {});
  params = new Observable<Params>(_subscriber => {});
  queryParams = new Observable<Params>(_subscriber => {});
  fragment = new Observable<string>(_subscriber => {});
  data = new Observable<Data>(_subscriber => {});
  outlet = '';
  component: string | Type<any> | null = null;
  snapshot = new MockActivatedRouteSnapshot();

  get routeConfig(): Route | null {
    throw new Error('Method not implemented.');
  }

  get root(): ActivatedRoute {
    throw new Error('Method not implemented.');
  }

  get parent(): ActivatedRoute | null {
    throw new Error('Method not implemented.');
  }

  get firstChild(): ActivatedRoute | null {
    throw new Error('Method not implemented.');
  }

  get children(): ActivatedRoute[] {
    throw new Error('Method not implemented.');
  }

  get pathFromRoot(): ActivatedRoute[] {
    throw new Error('Method not implemented.');
  }

  get paramMap(): Observable<ParamMap> {
    throw new Error('Method not implemented.');
  }

  get queryParamMap(): Observable<ParamMap> {
    throw new Error('Method not implemented.');
  }

  toString(): string {
    throw new Error('Method not implemented.');
  }
}
