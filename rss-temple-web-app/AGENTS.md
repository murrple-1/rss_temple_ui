# AGENTS.md — rss-temple-web-app

The RSS Temple reader SPA. Angular 21, TypeScript, Clarity UI, zod. Read `../AGENTS.md` first for the repo
overview, conventions and the sibling repos. From this directory, the sibling repos are at `../../<repo>`.

## Commands

Run these in this directory.

```sh
yarn install
cp src/environments/environment.dev.ts src/environments/environment.ts   # git-ignored; CI does the same
yarn generate-licenses-file        # writes src/app/os-licenses.json (git-ignored); needed before test and build
yarn start                         # ng serve on :4200
yarn test --no-watch               # vitest through @angular/build:unit-test
yarn build
yarn lint                          # not run in CI, but keep it clean
npx prettier --check .
```

## How the app is put together

- **Runtime config.** The API host and other site settings are not in the Angular environment files.
  `src/app/services/config.service.ts` fetches `/assets/config.json` at startup and validates it with zod.
  The dev copy is `src/assets/config.json` (`apiHost: http://localhost:8000`). In production, Ansible writes
  this file. A key that the zod schema requires but the deployed file lacks breaks startup.
- **API client.** Hand-written services in `src/app/services/data/*.service.ts` call
  `` `${apiHost}/api/...` `` with `HttpClient` and parse responses with zod schemas (`*.interface.ts`).
  They are not generated from the backend's OpenAPI schema, so a backend shape change fails only at runtime.
- **Auth.** Session cookies (`withCredentials: true`) plus the `csrftoken` cookie sent as `X-CSRFToken`.
  Route guards are in `src/app/guards/`. Google and Facebook login are in `gauth.service.ts` and
  `fbauth.service.ts`.
- **Routes** are in `src/app/app.routing.ts`. `/main/**` is lazy-loaded behind `AuthGuard`. `/verify`,
  `/resetpassword`, `/register` and `/main/profile` are linked from backend emails and redirects, so do not
  rename them without changing the backend and Ansible as well.
- **Docker image.** `ng build -c production`, then Caddy serves `/srv` on port 4200 with an SPA fallback to
  `index.html`.

## Style

- Prettier: single quotes, trailing commas, `arrowParens: avoid`. The pre-commit hook applies it.
- Imports are sorted in groups: `@app/*`, then `@environments/*`, then relative. Use the `@app/` and
  `@environments/` path aliases instead of long relative paths.

## Writing tests

- Each `*.spec.ts` sits next to the file it tests.
- Global test setup is in `src/setup-test.ts`. Mocks for shared services (config, cookies, activated route,
  social auth) are in `src/app/test/`. Fixture files are in `src/test_files/`.
- Use the mocks rather than real HTTP. Tests must not call a backend.

## Definition of done

1. `yarn test --no-watch` passes.
2. `yarn lint` and `npx prettier --check .` pass.
3. `yarn build` succeeds if you changed config, routing, dependencies or build settings.
4. If you added a `config.json` key: the dev `src/assets/config.json` has it, and the Ansible template has it
   too (see `../AGENTS.md`).

## Do not

- Commit `src/environments/environment.ts` or `src/app/os-licenses.json`. Both are generated and git-ignored.
- Use `bypassSecurityTrust*` or `[innerHtml]` on new content without a review. See below.

## Security notes

- Feed-entry HTML is shown with `[innerHtml]="… | safeHtml"`, and the `safeHtml` pipe
  (`src/app/pipes/safe-html.pipe.ts`) **bypasses Angular's sanitizer**. This is safe only because the backend
  sanitizes feed content with bleach (`../../rss_temple/api/content_sanitize.py`). Do not use the pipe on any
  value that has not been through that sanitizer.
- Keep `withCredentials` and the CSRF header on all state-changing requests.
