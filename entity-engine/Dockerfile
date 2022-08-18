FROM mainstage-base:latest
COPY . /app
WORKDIR /app/entity-engine
RUN rm -rf config
RUN yarn build
ENTRYPOINT [ "yarn", "run-prod" ]