export interface CommonOptions {
  authToken?: string;
}

export function toHeaders(
  options: CommonOptions,
  authTokenFn: () => string | null,
) {
  const headers: Record<string, string | string[]> = {};

  const authToken = options.authToken ?? authTokenFn();
  if (authToken !== null) {
    headers['Authorization'] = `Token ${authToken}`;
  }

  return headers;
}
