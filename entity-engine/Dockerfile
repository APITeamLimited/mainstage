FROM node:16-alpine as builder

RUN npm install -g typescript
RUN mkdir /app

WORKDIR /app
COPY . /app
WORKDIR /app/entity-engine
RUN yarn install
RUN rm -rf config

ENTRYPOINT [ "yarn", "dev" ]