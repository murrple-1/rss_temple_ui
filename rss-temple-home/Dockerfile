FROM node:16-alpine

ENV APP_URL="" TWITTER_URL="" FB_URL="" INSTA_URL="" HEAD_CUSTOM_DIR=""

WORKDIR /build/

COPY . .

RUN yarn install --frozen-lockfile
