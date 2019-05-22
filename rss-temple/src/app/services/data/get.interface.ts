import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';

export interface GetOptions<Field> extends CommonOptions {
  fields?: Field[];
}

export function toHeaders<Field>(
  options: GetOptions<Field>,
  sessionTokenFn: () => string | null,
) {
  const headers = commonToHeaders(options, sessionTokenFn);
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
