import {
  CommonOptions,
  toHeader as commonToHeader,
} from '@app/services/data/common.interface';

export interface QueryOptions<Field> extends CommonOptions {
  count?: number;
  skip?: number;
  fields?: Field[];
  search?: string;
  sort?: string;
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

export function toBody<Field>(
  options: QueryOptions<Field>,
  fieldsFn: () => Field[],
) {
  const body: QueryBody<Field> = {
    fields: options.fields || fieldsFn(),
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
    body.sort = options.sort;
  }

  if (options.returnObjects !== undefined) {
    body.objects = options.returnObjects;
  }

  if (options.returnTotalCount !== undefined) {
    body.totalCount = options.returnTotalCount;
  }

  return body;
}

export function toHeader<Field>(
  options: QueryOptions<Field>,
  sessionTokenFn: () => string | null,
) {
  const headers = commonToHeader(options, sessionTokenFn);
  return headers;
}
