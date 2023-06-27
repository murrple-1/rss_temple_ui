export interface CommonOptions {
  apiSessionId?: string;
}

export function toHeaders(
  options: CommonOptions,
  apiSessionIdFn: () => string | null,
) {
  const headers: Record<string, string | string[]> = {};

  const apiSessionId = options.apiSessionId ?? apiSessionIdFn();
  if (apiSessionId !== null) {
    headers['X-Session-ID'] = apiSessionId;
  }

  return headers;
}
