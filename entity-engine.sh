docker build -t entity-engine . -f entity-engine/Dockerfile
docker tag entity-engine registry.gitlab.com/apiteamcloud/mainstage:entity-engine-latest
docker push registry.gitlab.com/apiteamcloud/mainstage:entity-engine-latest