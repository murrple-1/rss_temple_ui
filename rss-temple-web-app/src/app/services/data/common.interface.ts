export interface CommonOptions {}

export function toHeaders(_options: CommonOptions, csrfTokenFn: () => string) {
  const headers: Record<string, string | string[]> = {};

  const csrfToken = csrfTokenFn();
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  return headers;
}
