FROM mainstage-base:latest
COPY . /app
WORKDIR /app/mailman
RUN rm -rf config
RUN yarn build
ENTRYPOINT [ "yarn", "run-prod" ]