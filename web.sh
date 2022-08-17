mv redwood.toml redwood-dev.toml
mv redwood-prod.toml redwood.toml
docker build -t web . -f web/Dockerfile
docker tag web registry.gitlab.com/apiteamcloud/mainstage:web-latest
docker push registry.gitlab.com/apiteamcloud/mainstage:web-latest
mv redwood.toml redwood-prod.toml
mv redwood-dev.toml redwood.toml
