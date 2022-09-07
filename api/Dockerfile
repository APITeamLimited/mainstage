FROM mainstage-base:latest

# Remove mailman
RUN rm -rf /api
COPY . .
RUN cd api && rm -rf dist && cd .. && yarn rw build api
COPY production.json config/production.json
ENTRYPOINT [ "yarn", "rw", "serve", "api", "--apiRootPath", "api"]