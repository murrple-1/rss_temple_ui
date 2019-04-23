export interface CommonOptions {
  sessionToken?: string;
}

export function toHeader(
  options: CommonOptions,
  sessionTokenFn: () => string | null,
) {
  const headers: {
    [param: string]: string | string[];
  } = {};

  const sessionToken = options.sessionToken || sessionTokenFn();
  if (sessionToken !== null) {
    headers['X-Session-Token'] = sessionToken;
  }

  return headers;
}
