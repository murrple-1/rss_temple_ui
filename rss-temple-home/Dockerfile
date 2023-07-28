FROM node:16-alpine AS builder

WORKDIR /build

COPY . .

RUN apk add --no-cache autoconf automake make gcc musl-dev libtool pkgconfig nasm \
  && yarn install --frozen-lockfile \
  && yarn grunt build

FROM caddy:2 AS production

COPY --from=builder /build/dist/ /srv/
COPY ./Caddyfile /etc/caddy/Caddyfile
