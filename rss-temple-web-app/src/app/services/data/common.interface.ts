export interface CommonOptions {
  csrfToken?: string;
}

export function toHeaders(
  options: CommonOptions,
  csrfTokenFn: () => string | null,
) {
  const headers: Record<string, string | string[]> = {};

  const csrfToken = options.csrfToken ?? csrfTokenFn();
  if (csrfToken !== null) {
    headers['X-CSRFToken'] = csrfToken;
  }

  return headers;
}
