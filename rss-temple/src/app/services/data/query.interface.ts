import { HttpParams } from '@angular/common/http';

import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { Sort } from '@app/services/data/sort.interface';

export interface QueryOptions<Field, SortField extends string>
  extends CommonOptions {
  count?: number;
  skip?: number;
  fields?: Field[];
  search?: string;
  sort?: Sort<SortField>;
  returnObjects?: boolean;
  returnTotalCount?: boolean;
}

export interface QueryBody<Field> {
  count?: number;
  skip?: number;
  fields?: Field[];
  search?: string;
  sort?: string;
  objects?: boolean;
  totalCount?: boolean;
}

export function toBody<Field, SortField extends string>(
  options: QueryOptions<Field, SortField>,
  fieldsFn: () => Field[],
) {
  const body: QueryBody<Field> = {
    fields: options.fields ?? fieldsFn(),
  };

  if (options.count !== undefined) {
    body.count = options.count;
  }

  if (options.skip !== undefined) {
    body.skip = options.skip;
  }

  if (options.search !== undefined) {
    body.search = options.search;
  }

  if (options.sort !== undefined) {
    const sortParts: string[] = [];

    for (const [field, direction] of options.sort.entries()) {
      sortParts.push(`${field}:${direction}`);
    }

    body.sort = sortParts.join(',');
  }

  if (options.returnObjects !== undefined) {
    body.objects = options.returnObjects;
  }

  if (options.returnTotalCount !== undefined) {
    body.totalCount = options.returnTotalCount;
  }

  return body;
}

export function toHeaders<Field, SortField extends string>(
  options: QueryOptions<Field, SortField>,
  sessionTokenFn: () => string | null,
) {
  const headers = commonToHeaders(options, sessionTokenFn);
  return headers;
}

export function toParams(descriptor?: string) {
  let params = new HttpParams();

  if (descriptor !== undefined) {
    params = params.set('_', descriptor);
  }

  return params;
}
