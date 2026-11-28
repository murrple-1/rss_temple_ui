FROM node:22-alpine AS builder

ARG APP_ENVIRONMENT=production

WORKDIR /build/

COPY package.json yarn.lock .

RUN yarn install --frozen-lockfile \
  && yarn cache clean

ARG NODE_ENV=production

COPY . .

RUN cp /build/src/environments/environment.production.ts /build/src/environments/environment.ts \
  && yarn generate-licenses-file \
  && yarn collect-envvars \
  && yarn ng build -c ${APP_ENVIRONMENT}

FROM caddy:2-alpine AS production

# Run as a non-root user. Caddy listens on :4200 (a non-privileged port), and
# needs write access to its state dirs (/data, /config). /srv is also owned by
# the user, because deployments customize /srv/index.html at start-up with
# `sed -i`, which writes a temp file next to it. /srv exists in the base image,
# so `COPY --chown` alone doesn't change the directory's owner.
RUN addgroup -S caddy && adduser -S -G caddy caddy \
  && chown -R caddy:caddy /data /config /srv

COPY --from=builder --chown=caddy:caddy /build/dist/browser/ /srv/
COPY ./Caddyfile /etc/caddy/Caddyfile

USER caddy
