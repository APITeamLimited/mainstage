FROM mainstage-base:latest:latest
COPY . /app
WORKDIR /app/globe-test
RUN rm -rf config

ENTRYPOINT [ "yarn", "dev" ]