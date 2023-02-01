FROM node:16-alpine as builder

RUN npm install -g typescript
RUN mkdir /app

WORKDIR /app
COPY . .
# Needed as fails first time as prisma is not installed
RUN yarn install --inline-builds; exit 0
RUN yarn install --inline-builds; exit 0