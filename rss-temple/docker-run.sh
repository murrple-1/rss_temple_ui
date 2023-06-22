#!/usr/bin/env sh

set -eux

yarn generate-licenses-file
yarn collect-envvars
yarn run ng build -c ${1:-production}

exec caddy run --config ./Caddyfile --adapter "caddyfile"
