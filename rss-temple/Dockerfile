FROM caddy:2

COPY . .

RUN apk add --no-cache yarn \
  && yarn install --frozen-lockfile

ENTRYPOINT ["./docker-run.sh"]
