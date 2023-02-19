FROM mainstage-base:latest

# Remove test-manager
RUN rm -rf /test-manager
COPY . .
RUN rm -rf test-manager/config
RUN cd test-manager && rm -rf dist && yarn build
COPY production.json test-manager/config/production.json
ENTRYPOINT [ "yarn", "start-test-manager" ]