import {
  CommonOptions,
  toHeader as commonToHeader,
} from '@app/_services/data/common.interface';

export interface SomeOptions<Field> extends CommonOptions {
  count?: number;
  skip?: number;
  fields?: Field[];
  search?: string;
  sort?: string;
  returnObjects?: boolean;
  returnTotalCount?: boolean;
}

export function toHeader<Field>(
  options: SomeOptions<Field>,
  sessionTokenFn: () => string | null,
) {
  const headers = commonToHeader(options, sessionTokenFn);
  return headers;
}

export function toParams<Field>(
  options: SomeOptions<Field>,
  fieldsFn: () => Field[],
) {
  const params: {
    [header: string]: string | string[];
  } = {
    fields: (options.fields || fieldsFn()).join(','),
  };

  if (options.count !== undefined) {
    params['count'] = options.count.toString();
  }

  if (options.skip !== undefined) {
    params['skip'] = options.skip.toString();
  }

  if (options.search !== undefined) {
    params['search'] = options.search;
  }

  if (options.sort !== undefined) {
    params['sort'] = options.sort;
  }

  if (options.returnObjects !== undefined) {
    params['objects'] = options.returnObjects ? 'true' : 'false';
  }

  if (options.returnTotalCount !== undefined) {
    params['totalcount'] = options.returnTotalCount ? 'true' : 'false';
  }

  return params;
}
