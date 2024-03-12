import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { Sort } from '@app/services/data/sort.interface';

export interface CreateStableQueryOptions<SortField extends string>
  extends CommonOptions {
  search?: string;
  sort?: Sort<SortField>;
}

export interface StableQueryOptions<Field extends string>
  extends CommonOptions {
  token: string;
  count?: number;
  skip?: number;
  fields?: Field[];
  returnObjects?: boolean;
  returnTotalCount?: boolean;
}

export interface CreateStableQueryBody {
  search?: string;
  sort?: string;
}

export interface StableQueryBody<Field extends string> {
  token: string;
  count?: number;
  skip?: number;
  fields?: Field[];
  objects?: boolean;
  totalCount?: boolean;
}

export function toCreateStableQueryBody<SortField extends string>(
  options: CreateStableQueryOptions<SortField>,
) {
  const body: CreateStableQueryBody = {};

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

  return body;
}

export function toStableQueryBody<Field extends string>(
  options: StableQueryOptions<Field>,
  fieldsFn: () => Field[],
) {
  const body: StableQueryBody<Field> = {
    token: options.token,
    fields: options.fields ?? fieldsFn(),
  };

  if (options.count !== undefined) {
    body.count = options.count;
  }

  if (options.skip !== undefined) {
    body.skip = options.skip;
  }

  if (options.returnObjects !== undefined) {
    body.objects = options.returnObjects;
  }

  if (options.returnTotalCount !== undefined) {
    body.totalCount = options.returnTotalCount;
  }

  return body;
}

export function toCreateStableQueryHeaders<SortField extends string>(
  options: CreateStableQueryOptions<SortField>,
  csrfTokenFn: () => string | null,
) {
  const headers = commonToHeaders(options, csrfTokenFn);
  return headers;
}

export function toStableQueryHeaders<Field extends string>(
  options: StableQueryOptions<Field>,
  csrfTokenFn: () => string | null,
) {
  const headers = commonToHeaders(options, csrfTokenFn);
  return headers;
}

export function toCreateStableQueryParams(descriptor?: string) {
  const params: Record<string, string | string[]> = {};

  if (descriptor !== undefined) {
    params['_'] = descriptor;
  }

  return params;
}

export function toStableQueryParams(descriptor?: string) {
  const params: Record<string, string | string[]> = {};

  if (descriptor !== undefined) {
    params['_'] = descriptor;
  }

  return params;
}
