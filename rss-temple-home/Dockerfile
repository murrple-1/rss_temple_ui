FROM node:20-alpine

ENV WEB_APP_URL="" \
  TWITTER_X_URL="" \
  FB_URL="" \
  INSTA_URL="" \
  HEAD_CUSTOM_DIR="" \
  GENERATE_SOURCE_MAPS="false"

WORKDIR /build/

COPY package.json yarn.lock .

RUN yarn install --frozen-lockfile \
  && yarn cache clean

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY . .
