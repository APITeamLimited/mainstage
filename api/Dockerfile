FROM mainstage-base:latest
COPY . /app
WORKDIR /app
RUN rm -rf /config
RUN rm -rf /api/config
RUN yarn rw build api
ENTRYPOINT [ "yarn", "rw", "serve", "api" ]