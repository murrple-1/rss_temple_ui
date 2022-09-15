#!/usr/bin/env sh

set -eux

yarn run grunt build --app-url="$1" --twitter-url="$2" --fb-url="$3" --insta-url="$4"

caddy run --config ./Caddyfile --adapter "caddyfile"
