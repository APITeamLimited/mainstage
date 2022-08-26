FROM mainstage-base:latest
COPY . /app
WORKDIR /app/store
RUN rm -rf config
RUN yarn build
ENTRYPOINT [ "yarn", "run-prod" ]