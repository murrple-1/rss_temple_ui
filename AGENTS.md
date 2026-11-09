# AGENTS.md — rss_temple_ui (frontend)

Frontends for RSS Temple, a self-hostable RSS/Atom reader. It is one of four repos; see
[Sibling repositories](#sibling-repositories) for the others and when to read them.

## Layout

This is **not** a yarn workspace. Each app has its own `package.json`, `yarn.lock`, lint and format config,
and its own `AGENTS.md` with app-specific detail. The two apps share no code.

- `rss-temple-web-app/` — the reader SPA (Angular). See `rss-temple-web-app/AGENTS.md`.
- `rss-temple-home/` — the static landing site (Eleventy). See `rss-temple-home/AGENTS.md`.
- `raw/` — source images only.
- Root `package.json` — only husky, lint-staged and prettier, for the pre-commit hook. Run `yarn install` at the
  root once to install the hook. It runs `prettier --write` on staged files with each app's own `.prettierrc`.

CI is CircleCI only (`.circleci/config.yml`): web-app tests, `prettier --check` on both apps, eslint on home.
On `master` it pushes `murraychristopherson/rss_temple_web_app:latest` and `rss_temple_home:latest`; on tags it
pushes `:<tag>`.

## Conventions

- Short imperative commit subjects. Add a scope prefix when the change is limited to one area:
  `home: …`, `ModalOpenService: …`.
- Work reaches `master` through GitHub PRs from `fix/…` or feature branches. Do not commit to `master`
  directly.
- A PR description says what changed and why, and how it was tested. If the change depends on a backend or
  Ansible change, link that PR.

## Do not

- Create git tags. A tag is a release, and CI publishes it to Docker Hub.
- Edit a `yarn.lock` by hand. Run `yarn install` or `yarn add` in that app.
- Run `yarn install` at the root expecting it to install the apps. It only installs the hook tooling.

## Sibling repositories

RSS Temple is split across four repos, normally checked out side by side. Local paths are relative to this
repo's root (add one more `../` from inside an app directory). If a sibling is not checked out, use its GitHub
URL (for example with `gh`).

| Repo | Local path | GitHub | What it provides |
| --- | --- | --- | --- |
| Backend | `../rss_temple` | https://github.com/murrple-1/rss_temple | Django API, workers, scheduler, `rss_temple` image |
| Frontend (this repo) | `.` | https://github.com/murrple-1/rss_temple_ui | Angular web app and Eleventy landing site, `rss_temple_web_app` and `rss_temple_home` images |
| Deployment | `../ansible-collection-rss-temple` | https://github.com/murrple-1/ansible-collection-rss-temple | Ansible collection `murrple_1.rss_temple` that deploys all images on one server |
| Infrastructure | `../terraform-rss-temple` | https://github.com/murrple-1/terraform-rss-temple | Terraform for the Linode server and firewall |

The backend's `README.md` is the main install and usage document for the whole project.

### When to read them from here

- **Writing or changing an API call** — the source of truth is the backend: routes in
  `../rss_temple/api/urls.py`, views in `../rss_temple/api/views/`, shapes in
  `../rss_temple/api/serializers.py`. For query endpoints, the allowed search, sort and field names are in
  `../rss_temple/query_utils/`. A running backend also serves its OpenAPI schema at `/schema/`, and
  docs at `/swagger/`.
- **Auth, CSRF, CORS or cookie problems** — `../rss_temple/rss_temple/settings.py` (`APP_CORS_*`,
  `APP_CSRF_*`, `APP_SESSION_COOKIE_*`) and `../rss_temple/api/authentication.py`.
- **Rendering feed content** — the backend sanitizes feed HTML (`../rss_temple/api/content_sanitize.py`), and
  the web app trusts that output. See the security notes in `rss-temple-web-app/AGENTS.md`.
- **Renaming a route that emails or redirects link to** — update the backend defaults
  (`APP_ACCOUNT_CONFIRM_EMAIL_URL`, `APP_PASSWORD_RESET_CONFIRM_URL_FORMAT`, `APP_SOCIAL_*_URL` in
  `../rss_temple/rss_temple/settings.py`) and the matching Ansible prompts.
- **Adding a key to `config.json` or a home env var** — production values are written by
  `../ansible-collection-rss-temple/roles/rss_temple_web_app/templates/config.json.j2` and
  `roles/rss_temple_home/templates/.env.j2`. Add the key there too. The playbooks never overwrite an existing
  config file, so a new key also needs an "Upgrading" note in that repo's `CHANGELOG.md`.
- **Production serving, domains, TLS, headers** — the infra Caddy and per-app Caddyfiles are in the
  Ansible roles (`pre_rss_temple`, `rss_temple_web_app`, `rss_temple_home`).
- **Running the full stack locally** — start the backend with Docker Compose in `../rss_temple` (see its
  `AGENTS.md`). It listens on `localhost:8000`, which matches the web app's dev `config.json`.
