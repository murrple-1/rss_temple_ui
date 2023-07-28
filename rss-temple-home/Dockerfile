FROM node:16-alpine

ENV APP_URL="" TWITTER_URL="" FB_URL="" INSTA_URL=""

WORKDIR /build/

COPY . .

RUN apk add --no-cache autoconf automake make gcc musl-dev libtool pkgconfig nasm \
  && yarn install --frozen-lockfile

ENTRYPOINT ["./docker-run.sh"]
