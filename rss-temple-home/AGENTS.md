# AGENTS.md — rss-temple-home

The RSS Temple landing site. Eleventy 3, sass, esbuild. Read `../AGENTS.md` first for the repo overview,
conventions and the sibling repos. From this directory, the sibling repos are at `../../<repo>`.

## Commands

Run these in this directory.

```sh
yarn install
yarn start                         # eleventy --serve
yarn build                         # output in _site/
yarn lint                          # eslint src/
npx prettier --check .
```

## How the site is put together

- Sources are in `src/`, default page content in `default_content/`, images in `media/`, and config in
  `.eleventy.js`.
- The site is built from env vars: `SITE_URL`, `WEB_APP_URL` (links into the reader app), `TWITTER_X_URL`,
  `FB_URL`, `INSTA_URL`, `CUSTOM_HTML_DIR`, `GENERATE_SOURCE_MAPS`.
- `CUSTOM_HTML_DIR` lets a deployment supply its own page content. The Ansible role
  `../../ansible-collection-rss-temple/roles/rss_temple_home/` uses it for `contact.html`, `tos.html`,
  `privacy.html` and the `*.head.html` files that hold the og: tags.
- **Docker image.** The site is built when the container starts, not when the image is built. In
  `docker-compose.yml`, the container copies `_site` into a shared volume, and a separate Caddy container
  serves it on port 3000.

## Definition of done

1. `yarn lint` and `npx prettier --check .` pass.
2. `yarn build` succeeds, and the pages you changed look right under `yarn start`.
3. If you added an env var: the Dockerfile and `docker-compose.yml` pass it through, and the Ansible role's
   `templates/.env.j2` sets it. The playbooks never overwrite an existing config file, so a new variable also
   needs an "Upgrading" note in the Ansible repo's `CHANGELOG.md`.

## Do not

- Commit `_site/`. It is build output.
