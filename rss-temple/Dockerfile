FROM node:16-alpine AS builder

ARG APP_ENVIRONMENT=production

WORKDIR /build/

COPY . .

RUN cp /build/src/environments/environment.production.ts /build/srv/environments/environment.ts \
  && yarn install --frozen-lockfile \
  && yarn generate-licenses-file \
  && yarn collect-envvars \
  && yarn run ng build -c ${APP_ENVIRONMENT}

FROM caddy:2-alpine AS production

COPY --from=builder /build/dist/ /srv/
COPY ./Caddyfile /etc/caddy/Caddyfile
