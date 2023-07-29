#!/usr/bin/env sh

set -eux

[ "$(ls -A /srv/)" ] || echo '<html><body><h1>Building Site...</h1></body></html>' > /srv/index.html

yarn run grunt build --app-url="$APP_URL" --twitter-url="$TWITTER_URL" --fb-url="$FB_URL" --insta-url="$INSTA_URL"

rm -rf /srv/* && cp -R /build/dist/* /srv/

while :
  sleep 60
done
