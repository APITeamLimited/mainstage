FROM mainstage-base:latest
COPY . /app
WORKDIR /app/entity-engine
RUN rm -rf config

ENTRYPOINT [ "yarn", "dev" ]