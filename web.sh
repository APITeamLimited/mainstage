docker build -t web . -f web/Dockerfile
docker tag web registry.gitlab.com/apiteamcloud/mainstage:web-latest
docker push registry.gitlab.com/apiteamcloud/mainstage:web-latest