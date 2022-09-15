#!/usr/bin/env sh

set -eux

yarn generate-licenses-file
yarn run ng build -c ${1:-production}

caddy run --config ./Caddyfile --adapter "caddyfile"
