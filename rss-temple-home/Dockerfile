FROM caddy:2

ENV APP_URL="" TWITTER_URL="" FB_URL="" INSTA_URL=""

COPY . .

RUN apk add --no-cache yarn autoconf automake make gcc musl-dev libtool pkgconfig nasm \
  && yarn install --frozen-lockfile

ENTRYPOINT ["./docker-run.sh"]
