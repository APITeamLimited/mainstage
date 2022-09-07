FROM mainstage-base:latest

# Remove mailman
RUN rm -rf /mailman
COPY . .
RUN rm -rf mailman/config
RUN cd mailman && rm -rf dist && yarn build
COPY production.json mailman/config/production.json
ENTRYPOINT [ "yarn", "start-mailman" ]