import {
  CommonOptions,
  toHeader as commonToHeader,
} from '@app/_services/data/common.interface';

export interface GetOptions<Field> extends CommonOptions {
  fields?: Field[];
}

export function toHeader<Field>(
  options: GetOptions<Field>,
  sessionTokenFn: () => string | null,
) {
  const headers = commonToHeader(options, sessionTokenFn);
  return headers;
}

export function toParams<Field>(
  options: GetOptions<Field>,
  fieldsFn: () => Field[],
) {
  const params: {
    [header: string]: string | string[];
  } = {
    fields: (options.fields || fieldsFn()).join(','),
  };

  return params;
}
