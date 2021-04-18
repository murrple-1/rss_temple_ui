export interface CommonOptions {
  sessionToken?: string;
}

export function toHeaders(
  options: CommonOptions,
  sessionTokenFn: () => string | null,
) {
  const headers: Record<string, string | string[]> = {};

  const sessionToken = options.sessionToken ?? sessionTokenFn();
  if (sessionToken !== null) {
    headers['X-Session-Token'] = sessionToken;
  }

  return headers;
}
