FROM mainstage-base:latest

# Remove entity-engine
RUN rm -rf /entity-engine
COPY . .
RUN rm -rf entity-engine/config
RUN cd entity-engine && rm -rf dist && yarn build
COPY production.json entity-engine/config/production.json
ENTRYPOINT [ "yarn", "start-entity-engine" ]