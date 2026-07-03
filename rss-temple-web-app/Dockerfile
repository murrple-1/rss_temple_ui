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

COPY --from=builder /build/dist/browser/ /srv/
COPY ./Caddyfile /etc/caddy/Caddyfile

# Run as a non-root user. Caddy listens on :4200 (a non-privileged port), and
# only needs write access to its state dirs (/data, /config).
RUN addgroup -S caddy && adduser -S -G caddy caddy \
  && chown -R caddy:caddy /data /config
USER caddy
