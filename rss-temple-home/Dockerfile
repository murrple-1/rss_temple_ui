FROM caddy:2
RUN apt add yarn
COPY . .
RUN yarn install --frozen-lockfile

ENTRYPOINT ["./docker-run.sh"]
