FROM mainstage-base:latest

# Remove globe-test
RUN rm -rf /globe-test
COPY . .
RUN rm -rf globe-test/config
RUN cd globe-test && rm -rf dist && yarn build
COPY production.json globe-test/config/production.json
ENTRYPOINT [ "yarn", "start-globe-test" ]