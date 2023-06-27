import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';

export interface GetOptions<Field extends string> extends CommonOptions {
  fields?: Field[];
}

export function toHeaders<Field extends string>(
  options: GetOptions<Field>,
  apiSessionIdFn: () => string | null,
) {
  const headers = commonToHeaders(options, apiSessionIdFn);
  return headers;
}

export function toParams<Field extends string>(
  options: GetOptions<Field>,
  fieldsFn: () => Field[],
) {
  const params: Record<string, string | string[]> = {
    fields: (options.fields ?? fieldsFn()).join(','),
  };

  return params;
}
