#!/usr/bin/env sh

set -eux

yarn run grunt build --app-url="$APP_URL" --twitter-url="$TWITTER_URL" --fb-url="$FB_URL" --insta-url="$INSTA_URL"

exec caddy run --config ./Caddyfile --adapter "caddyfile"
