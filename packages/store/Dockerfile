FROM mainstage-base:latest

# Remove store
RUN rm -rf /store
COPY . .
RUN rm -rf store/config
RUN cd store && rm -rf dist && yarn build
COPY production.json store/config/production.json
ENTRYPOINT [ "yarn", "start-store" ]