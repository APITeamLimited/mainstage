FROM mainstage-base:latest

# Remove web
RUN rm -rf /web
COPY . .

# Just so can get dev env vars
COPY web-env.json config/production.json

RUN cd web && rm -rf dist && cd .. && NODE_ENV=production yarn rw build web

COPY production.json config/production.json


ENTRYPOINT [ "yarn", "rw", "serve", "web"]