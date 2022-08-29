FROM mainstage-base:latest
COPY . /app
WORKDIR /app/globe-test
RUN rm -rf config
RUN yarn build
ENTRYPOINT [ "yarn", "run-prod" ]