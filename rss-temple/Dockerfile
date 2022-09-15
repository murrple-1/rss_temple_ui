FROM caddy:2
RUN apk add yarn
COPY . .
RUN yarn install --frozen-lockfile

ENTRYPOINT ["./docker-run.sh"]
