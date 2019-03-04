export interface CommonOptions {
  sessionToken?: string;
}

export function toHeader(
  options: CommonOptions,
  sessionTokenFn: () => string | null,
) {
  const headers: {
    [param: string]: string | string[];
  } = {
    'X-Session-Token': options.sessionToken || sessionTokenFn()!,
  };

  return headers;
}
